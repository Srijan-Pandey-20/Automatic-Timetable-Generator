// src/pages/admin/Sections.jsx
// Controls: Branch + Sem Cycle (Odd = 1,3,5,7 / Even = 2,4,6,8). Rows are the card style
// used before the Subjects redesign. Letters/subgroup names are derived, never stored.
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "@/services/sectionService";
import { getBranches } from "@/services/branchService";
import { deriveSections } from "@/utils/sectionNaming";

const selectClass = "w-full border rounded-md px-3 py-2 text-sm bg-background";

// The two cycles of an academic year. Semesters of one cycle run together.
const CYCLES = [
  { value: "odd", label: "Odd Semesters (1, 3, 5, 7)", semesters: [1, 3, 5, 7] },
  { value: "even", label: "Even Semesters (2, 4, 6, 8)", semesters: [2, 4, 6, 8] },
];

export default function Sections() {
  const [rawSections, setRawSections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [branchId, setBranchId] = useState(""); // "" = nothing selected yet
  const [cycle, setCycle] = useState(""); // "" = nothing selected yet

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // null = add mode
  const [semesterInput, setSemesterInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [sectionData, branchData] = await Promise.all([getSections(), getBranches()]);
    setRawSections(sectionData);
    setBranches(branchData);
    setLoading(false);
  }

  async function reloadSections() {
    setRawSections(await getSections());
  }

  // Recomputed on every render from the current raw sections + branches — this is what
  // makes deleting a section automatically renumber every section after it.
  const sections = deriveSections(rawSections, branches);

  const orderedBranches = [...branches].sort((a, b) => a.order - b.order);
  const selectedBranch = branches.find((b) => String(b.id) === branchId);
  const selectedCycle = CYCLES.find((c) => c.value === cycle);
  const ready = Boolean(selectedBranch && selectedCycle);
  const cycleSemesters = selectedCycle ? selectedCycle.semesters : [];

  const rowsFor = (semester) =>
    selectedBranch
      ? sections.filter((s) => s.branchId === selectedBranch.id && s.semester === semester)
      : [];
  // Only semesters that actually have sections are listed.
  const semestersWithSections = cycleSemesters.filter((sem) => rowsFor(sem).length > 0);

  function openAddDialog() {
    setEditingSection(null);
    setSemesterInput(String(cycleSemesters[0]));
    setErrorMsg("");
    setDialogOpen(true);
  }

  function openEditDialog(section) {
    setEditingSection(section);
    setSemesterInput(String(section.semester));
    setErrorMsg("");
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg("");
    try {
      const semesterNum = Number(semesterInput);
      if (editingSection) {
        await updateSection(editingSection.id, selectedBranch.id, semesterNum);
      } else {
        await createSection(selectedBranch.id, semesterNum);
      }
      await reloadSections();
      setDialogOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(section) {
    const confirmed = window.confirm(
      `Delete Section ${section.letter} of ${selectedBranch.code}, Semester ${section.semester}? ` +
        "Every section after it in the same branch and semester will shift down one letter, " +
        "and its subgroup numbers will renumber. This cannot be undone."
    );
    if (!confirmed) return;
    await deleteSection(section.id);
    await reloadSections();
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Sections</h1>
        <div className="flex flex-wrap items-center gap-3">
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

          <select
            aria-label="Sem cycle"
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            className={`${selectClass} w-auto`}
          >
            <option value="" disabled>
              Select Sem Cycle
            </option>
            {CYCLES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <Button onClick={openAddDialog} disabled={!ready}>
            Add Section
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading sections…</p>
      ) : !ready ? (
        <p className="text-sm text-muted-foreground">
          Select Branch and Sem Cycle to see sections.
        </p>
      ) : semestersWithSections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sections for {selectedBranch.code} in the {selectedCycle.value} semesters yet. Click
          "Add Section" to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {semestersWithSections.map((semester) => (
            <div key={semester} className="bg-muted/40 rounded-xl p-4 space-y-2">
              <div className="text-sm font-medium text-muted-foreground pl-1">Sem {semester}</div>
              <div className="space-y-1.5">
                {rowsFor(semester).map((section) => (
                  <div
                    key={section.id}
                    className="bg-background border rounded-md px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-semibold text-sm">Section {section.letter}</span>
                      <span className="text-sm text-muted-foreground">
                        {section.subgroups.map((sg) => sg.name).join(", ")}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(section)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(section)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "Edit Section" : "Add Section"}
              {selectedBranch ? ` — ${selectedBranch.code}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="section-semester">Semester</Label>
              <select
                id="section-semester"
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className={selectClass}
              >
                {cycleSemesters.map((n) => (
                  <option key={n} value={n}>
                    Semester {n}
                  </option>
                ))}
              </select>
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