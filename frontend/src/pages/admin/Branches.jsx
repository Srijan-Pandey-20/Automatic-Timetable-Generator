// src/pages/admin/Branches.jsx
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  reorderBranches,
} from "@/services/branchService";
import { getSections, deleteSection } from "@/services/sectionService";
import { getOrderedBranches } from "@/utils/branchOrdering";

// Wraps a single existing TableRow with drag behavior. The drag identity
// is branch.id (stable, permanent) — never displayPosition, which changes
// on every reorder and would confuse dnd-kit's tracking.
function SortableBranchRow({ branch, onEdit, onDelete, deletingId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: branch.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[36px]">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground inline-flex"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </TableCell>
      <TableCell className="w-[60px]">{branch.displayPosition}</TableCell>
      <TableCell className="w-[100px] font-mono font-semibold">
        {branch.code}
      </TableCell>
      <TableCell>{branch.name}</TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(branch)}>
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(branch)}
          disabled={deletingId === branch.id}
        >
          {deletingId === branch.id ? "Deleting…" : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null); // tracks in-progress cascade delete

  // Derived every render — never stored. Guarantees the S.No column is
  // always a gap-free 1..N regardless of what has been deleted.
  const orderedBranches = getOrderedBranches(branches);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    setLoading(true);
    const data = await getBranches();
    setBranches(data);
    setLoading(false);
  }

  function openAddDialog() {
    setEditingBranch(null);
    setNameInput("");
    setCodeInput("");
    setErrorMsg("");
    setDialogOpen(true);
  }

  function openEditDialog(branch) {
    setEditingBranch(branch);
    setNameInput(branch.name);
    setCodeInput(branch.code);
    setErrorMsg("");
    setDialogOpen(true);
  }

  async function handleSave() {
    const trimmedName = nameInput.trim();
    const trimmedCode = codeInput.trim();
    if (!trimmedName || !trimmedCode) {
      setErrorMsg("Both name and code are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, trimmedName, trimmedCode);
      } else {
        await createBranch(trimmedName, trimmedCode);
      }
      await loadBranches();
      setDialogOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Cascading delete: branch -> every Section with that branchId -> gone.
  // Subgroups need no separate call since they are always derived, never
  // stored (see src/utils/sectionNaming.js), so removing the Section is
  // sufficient to remove its subgroups too.
  async function handleDelete(branch) {
    setDeletingId(branch.id);

    const allSections = await getSections();
    const affectedSections = allSections.filter(
      (s) => s.branchId === branch.id
    );

    const warningMessage =
      affectedSections.length > 0
        ? `Delete branch "${branch.name}" (${branch.code})? This will also permanently delete ${affectedSections.length} section(s) and their subgroups under this branch. This cannot be undone.`
        : `Delete branch "${branch.name}" (${branch.code})? This cannot be undone.`;

    const confirmed = window.confirm(warningMessage);
    if (!confirmed) {
      setDeletingId(null);
      return;
    }

    await Promise.all(affectedSections.map((s) => deleteSection(s.id)));
    await deleteBranch(branch.id);

    await loadBranches();
    setDeletingId(null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedBranches.findIndex((b) => b.id === active.id);
    const newIndex = orderedBranches.findIndex((b) => b.id === over.id);
    const newSequence = arrayMove(orderedBranches, oldIndex, newIndex);

    // Optimistic UI update — strip the derived displayPosition back out
    // before writing to state; it's recomputed on next render regardless.
    const newBranches = newSequence.map(({ displayPosition, ...rest }, index) => ({
      ...rest,
      order: index,
    }));
    setBranches(newBranches);

    try {
      await reorderBranches(newSequence.map((b) => b.id));
    } catch {
      await loadBranches(); // revert to server truth if persisting failed
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Branches</h1>
        <Button onClick={openAddDialog}>Add Branch</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading branches…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36px]"></TableHead>
              <TableHead className="w-[60px]">S.No</TableHead>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {orderedBranches.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No branches yet. Click "Add Branch" to create one.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedBranches.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {orderedBranches.map((branch) => (
                    <SortableBranchRow
                      key={branch.id}
                      branch={branch}
                      onEdit={openEditDialog}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          )}
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add Branch"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-code">Branch Code</Label>
              <Input
                id="branch-code"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CS"
                maxLength={4}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>
            {errorMsg && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}