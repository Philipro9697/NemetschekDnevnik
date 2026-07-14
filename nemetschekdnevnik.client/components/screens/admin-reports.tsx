"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Megaphone, Server, Clock, CheckCircle2, Send } from "lucide-react";

// Real backend API services and types
import { gradeService } from "@/api/gradeService";
import { adminService } from "@/api/adminService";
import { studentService } from "@/api/studentService";
import type {
  ClassDto,
  SubjectDto,
  StudentInfoDto,
  GradeDto,
} from "@/api/types";

const TERMS = [
  { value: "term1", label: "Първи срок" },
  { value: "term2", label: "Втори срок" },
  { value: "year", label: "Годишен" },
];

// Helper to format school terms matching your codebase convention
function inferGradeSection(entryDate: string): string {
  if (!entryDate) return "term1";
  const month = new Date(entryDate).getMonth() + 1;
  return month <= 6 ? "term1" : "term2";
}

// Helper to format Class names cleanly (e.g., 10 "A")
function formatClassName(c?: any): string {
  if (!c) return "—";
  // Checks for pre-formatted names first (e.g. c.name -> "10 A"), then builds from grade/letter
  if (c.name) return c.name;
  if (c.className) return c.className;
  return `${c.classGrade ?? ""} "${c.classLetter ?? ""}"`.trim();
}
export function AdminReports() {
  const app = useApp();
  const [year, setYear] = useState("2025/2026");
  const [term, setTerm] = useState("term1");
  const [classId, setClassId] = useState<string>("all");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [msgOpen, setMsgOpen] = useState(false);

  // Real Database State
  const [realClasses, setRealClasses] = useState<ClassDto[]>([]);
  const [realSubjects, setRealSubjects] = useState<SubjectDto[]>([]);
  const [realStudents, setRealStudents] = useState<StudentInfoDto[]>([]);
  const [realGrades, setRealGrades] = useState<GradeDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all reporting data from SQL Database on page mount
  useEffect(() => {
    setLoading(true);

    adminService
      .getClasses()
      .then((data) => setRealClasses(data || []))
      .catch((err) => console.error("Failed to load classes:", err));

    // CHANGE THIS LINE: Swap studentService for adminService
    adminService
      .getSubjects()
      .then((data) => setRealSubjects(data || []))
      .catch((err) => console.error("Failed to load admin subjects:", err));

    adminService
      .getStudents()
      .then((data) => setRealStudents(data || []))
      .catch((err) => console.error("Failed to load students:", err));

    gradeService
      .getAllGrades()
      .then((data) => setRealGrades(data || []))
      .catch((err) => console.error("Failed to load grades:", err))
      .finally(() => setLoading(false));
  }, []);

  // Build a per-student success summary using REAL database records
  const rows = useMemo(() => {
    // 1. Filter students based on selected Class dropdown
    const targetStudents =
      classId === "all"
        ? realStudents
        : realStudents.filter((s) => s.classId.toString() === classId);

    // 2. Map every student and calculate their filtered grades
    return (
      targetStudents
        .map((s) => {
          const gs = realGrades.filter((g) => {
            const matchesStudent = g.studentId === s.studentId;
            const matchesSubject =
              subjectId === "all" || g.subjectId.toString() === subjectId;
            // Connects the "Срок" dropdown filter directly to the date of the grade
            const matchesTerm =
              term === "year" || inferGradeSection(g.entryDate) === term;

            return matchesStudent && matchesSubject && matchesTerm;
          });

          const avg =
            gs.length > 0
              ? gs.reduce((acc, g) => acc + Number(g.gradeValue), 0) / gs.length
              : 0;

          return { student: s, count: gs.length, avg };
        })
        // Notice: No ".filter((r) => r.count > 0)"! All students stay in the table!
        .sort((a, b) => b.avg - a.avg)
    );
  }, [realStudents, realGrades, classId, subjectId, term]);

  // Calculate global average ONLY among students who actually have grades
  const activeRows = rows.filter((r) => r.count > 0);
  const classAvg =
    activeRows.length > 0
      ? (activeRows.reduce((a, r) => a + r.avg, 0) / activeRows.length).toFixed(
          2,
        )
      : "—";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Филтри за справка</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Учебна година">
            <Select
              value={year}
              onChange={setYear}
              options={[
                ["2025/2026", "2025/2026"],
                ["2024/2025", "2024/2025"],
              ]}
            />
          </Field>
          <Field label="Срок">
            <Select
              value={term}
              onChange={setTerm}
              options={TERMS.map((t) => [t.value, t.label])}
            />
          </Field>
          <Field label="Клас">
            <Select
              value={classId}
              onChange={setClassId}
              disabled={loading && realClasses.length === 0}
              options={[
                ["all", "Всички класове"],
                ...realClasses.map(
                  (c: any) =>
                    [String(c.classId ?? c.id ?? ""), formatClassName(c)] as [
                      string,
                      string,
                    ],
                ),
              ]}
            />
          </Field>
          <Field label="Предмет">
            <Select
              value={subjectId}
              onChange={setSubjectId}
              disabled={loading && realSubjects.length === 0}
              options={[
                ["all", "Всички предмети"],
                ...realSubjects.map(
                  (s: any) =>
                    [
                      String(s.subjectId ?? s.id ?? ""),
                      s.subjectName ?? s.name ?? "Предмет",
                    ] as [string, string],
                ),
              ]}
            />
          </Field>
        </CardBody>
      </Card>

      {/* Global message action */}
      <div className="grid gap-4 sm:grid-cols-1">
        <button
          onClick={() => setMsgOpen(true)}
          className="flex items-center gap-4 rounded-2xl border border-success/30 bg-success/5 p-5 text-left transition-colors hover:bg-success/10"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground">
            <Megaphone className="size-6" />
          </span>
          <div>
            <p className="font-heading font-bold">Изпрати глобално съобщение</p>
            <p className="text-sm text-muted-foreground">
              Известие до всички ученици, родители и учители.
            </p>
          </div>
        </button>
      </div>

      {/* Report preview */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-semibold">Успех — преглед</h3>
            <p className="text-xs text-muted-foreground">
              {classId === "all"
                ? "Всички класове"
                : formatClassName(
                    realClasses.find((c) => c.classId.toString() === classId),
                  ) + " клас"}{" "}
              ·{" "}
              {subjectId === "all"
                ? "всички предмети"
                : realSubjects.find((s) => s.subjectId.toString() === subjectId)
                    ?.subjectName}{" "}
              · {TERMS.find((t) => t.value === term)?.label}
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-2xl font-bold text-primary">
              {classAvg}
            </p>
            <p className="text-xs text-muted-foreground">Среден успех</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Ученик</th>
                <th className="px-5 py-3 font-semibold">Клас</th>
                <th className="px-5 py-3 font-semibold">Брой оценки</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Среден успех
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    Зареждане на данни от сървъра...
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const studentClass = realClasses.find(
                    (c) => c.classId === r.student.classId,
                  );
                  return (
                    <tr key={r.student.studentId} className="hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium">
                        {r.student.firstName} {r.student.lastName}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatClassName(studentClass)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.count}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {r.count > 0 ? (
                          <Badge
                            tone={
                              r.avg >= 5.5
                                ? "success"
                                : r.avg >= 4
                                  ? "primary"
                                  : "danger"
                            }
                          >
                            {r.avg.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="font-medium text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Няма намерени ученици за избраните филтри.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="size-4.5 text-primary" /> Системна поддръжка
          </CardTitle>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
            <Clock className="size-5 text-success" />
            <div>
              <p className="text-sm font-medium text-success">
                Следващ автоматичен архив
              </p>
              <p className="text-xs text-muted-foreground">Неделя, 02:00 ч.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
            <CheckCircle2 className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Последна месечна актуализация
              </p>
              <p className="text-xs text-muted-foreground">
                01 юли 2026 · успешна
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <GlobalMessageDialog open={msgOpen} onClose={() => setMsgOpen(false)} />
    </div>
  );
}

function GlobalMessageDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const app = useApp();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const normalized = text.trim();
    if (!normalized) return;
    app.sendGlobalAnnouncement(normalized);
    setSent(true);
  }
  function handleClose() {
    setText("");
    setSent(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Глобално съобщение"
      description="Известието ще бъде изпратено до всички потребители веднага."
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="size-6 text-success" />
            <p className="text-sm font-medium text-success">
              Съобщението беше изпратено до всички ученици, родители и учители.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Готово</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Текст на съобщението</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="напр. Утре, 15 октомври, учебните занятия започват в 09:00 ч."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Отказ
            </Button>
            <Button onClick={handleSend} disabled={!text.trim()}>
              <Send className="size-4" /> Изпрати до всички
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}
