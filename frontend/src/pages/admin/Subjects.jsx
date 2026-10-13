// src/pages/admin/Subjects.jsx
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  reorderSubjects,
} from "@/services/subjectService";
import { getBranches } from "@/services/branchService";

const selectClass = "w-full border rounded-md px-3 py-2 text-sm bg-background";

const YEARS = [
  { value: 1, label: "First Year" },
  { value: 2, label: "Second Year" },
  { value: 3, label: "Third Year" },
  { value: 4, label: "Fourth Year" },
];

// Year n contains semesters 2n-1 and 2n.
const semestersOfYear = (year) => [2 * year - 1, 2 * year];

const EMPTY_FORM = { code: "", name: "", semester: "1", credits: "3", L: "3", T: "0", P: "0" };

// One draggable table row. The grip icon is the drag handle, so Edit/Delete buttons stay clickable.
function SortableSubjectRow({ subject, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subject.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          type="button"
          aria-label={`Drag to reorder ${subject.code}`}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-mono text-xs">{subject.code}</TableCell>
      <TableCell className="font-medium">{subject.name}</TableCell>
      <TableCell>{subject.credits}</TableCell>
      <TableCell>
        {subject.L}-{subject.T}-{subject.P}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(subject)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(subject)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}

// One table of papers (a semester, or the Open Electives list). Each table has its own
// DndContext, so a paper can only be dragged within its own table.
function SemesterTable({ rows, onReorder, onEdit, onDelete }) {
  const sensors = useSensors(
    // 5px of movement before a drag starts, so plain clicks never trigger a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    onReorder(arrayMove(rows, oldIndex, newIndex).map((r) => r.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Code</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>L-T-P</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No subjects for this semester yet.
              </TableCell>
            </TableRow>
          ) : (
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              {rows.map((subject) => (
                <SortableSubjectRow
                  key={subject.id}
                  subject={subject}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          )}
        </TableBody>
      </Table>
    </DndContext>
  );
}

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(""); // "" = nothing selected yet
  const [branchId, setBranchId] = useState(""); // "" = nothing selected yet

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [subjectData, branchData] = await Promise.all([getSubjects(), getBranches()]);
    setSubjects(subjectData);
    setBranches(branchData);
    setLoading(false);
  }

  async function reloadSubjects() {
    setSubjects(await getSubjects());
  }

  const orderedBranches = [...branches].sort((a, b) => a.order - b.order);
  const selectedBranch = branches.find((b) => String(b.id) === branchId);
  const selectedYear = YEARS.find((y) => String(y.value) === year);
  const ready = Boolean(selectedYear && selectedBranch);
  const yearSemesters = selectedYear ? semestersOfYear(selectedYear.value) : [];

  // Everything the selected branch studies in the selected year.
  const branchYearSubjects = selectedBranch
    ? subjects.filter((s) => s.branchId === selectedBranch.id && yearSemesters.includes(s.semester))
    : [];

  // Semester tables hold REGULAR papers only (electiveGroup is null). The Semester 3 table still
  // contains the single "Open Elective-I" row; the actual elective papers are listed separately.
  const rowsFor = (semester) =>
    branchYearSubjects
      .filter((s) => s.semester === semester && !s.electiveGroup)
      .sort((a, b) => a.order - b.order);

  // The elective papers offered to this branch, shown in their own table below the last semester.
  const electiveRows = branchYearSubjects
    .filter((s) => s.electiveGroup)
    .sort((a, b) => a.semester - b.semester || a.order - b.order);

  const yearHasSubjects = branchYearSubjects.length > 0;

  // One helper wires any input to form[key].
  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  function openAddDialog() {
    setEditingSubject(null);
    setForm({ ...EMPTY_FORM, semester: String(yearSemesters[0]) });
    setErrorMsg("");
    setDialogOpen(true);
  }

  function openEditDialog(subject) {
    setEditingSubject(subject);
    setForm({
      code: subject.code,
      name: subject.name,
      semester: String(subject.semester),
      credits: String(subject.credits),
      L: String(subject.L),
      T: String(subject.T),
      P: String(subject.P),
    });
    setErrorMsg("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg("");
    try {
      const payload = { ...form, branchId: selectedBranch.id };
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload);
      } else {
        await createSubject(payload);
      }
      await reloadSubjects();
      setDialogOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(subject) {
    const confirmed = window.confirm(
      `Delete ${subject.code} — ${subject.name} from ${selectedBranch.code}? This cannot be undone.`
    );
    if (!confirmed) return;
    await deleteSubject(subject.id);
    await reloadSubjects();
  }

  // Optimistic reorder: update the screen first, then sync; on failure, refetch the truth.
  async function handleReorder(orderedIds) {
    setSubjects((prev) =>
      prev.map((s) => {
        const index = orderedIds.indexOf(s.id);
        return index === -1 ? s : { ...s, order: index };
      })
    );
    try {
      await reorderSubjects(orderedIds);
    } catch {
      await reloadSubjects();
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Subjects</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${selectClass} w-auto`}
          >
            <option value="" disabled>
              Select Year
            </option>
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className={`${selectClass} w-auto max-w-xs`}
          >
            <option value="" disabled>
              Select Branch
            </option>
            {orderedBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>

          <Button onClick={openAddDialog} disabled={!ready}>
            Add Subject
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading subjects…</p>
      ) : !ready ? (
        <p className="text-sm text-muted-foreground">Select Year and Branch to see subjects.</p>
      ) : !yearHasSubjects ? (
        <p className="text-sm text-muted-foreground">
          No subjects added for {selectedBranch.code} in the {selectedYear.label.toLowerCase()} yet.
          Click “Add Subject” to create one.
        </p>
      ) : (
        <>
          {yearSemesters.map((semester) => {
            const rows = rowsFor(semester);
            return (
              <section key={semester} className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Semester {semester}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({rows.length} papers)
                  </span>
                </h2>
                <SemesterTable
                  rows={rows}
                  onReorder={handleReorder}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              </section>
            );
          })}

          {/* Separate table below the last semester; only branches that have open electives see it. */}
          {electiveRows.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                Open Electives{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({electiveRows.length} papers)
                </span>
              </h2>
              <SemesterTable
                rows={electiveRows}
                onReorder={handleReorder}
                onEdit={openEditDialog}
                onDelete={handleDelete}
              />
            </section>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add Subject"}
              {selectedBranch ? ` — ${selectedBranch.code}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="subject-code">Paper code</Label>
                <Input id="subject-code" placeholder="e.g. ACS101" autoFocus {...field("code")} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="subject-name">Subject name</Label>
                <Input id="subject-name" placeholder="e.g. Programming Languages" {...field("name")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-semester">Semester</Label>
              <select id="subject-semester" className={selectClass} {...field("semester")}>
                {yearSemesters.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                ["credits", "Credits"],
                ["L", "Lecture (L)"],
                ["T", "Tutorial (T)"],
                ["P", "Practical (P)"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`subject-${key}`}>{label}</Label>
                  <Input id={`subject-${key}`} type="number" min={0} max={10} {...field(key)} />
                </div>
              ))}
            </div>

            {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
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