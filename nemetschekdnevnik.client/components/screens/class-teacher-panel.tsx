'use client'

import { useMemo, useState } from 'react'
import { GraduationCap, BookOpenCheck, ChevronDown, ThumbsUp, AlertTriangle } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { GradePill } from '@/components/shared/grade-pill'
import { studentsOfClass, classById, subjectById, userById, formatDate, type Absence, type Grade, type GradeSection } from '@/lib/data'
import { cn } from '@/lib/utils'

const gradeSections: { key: GradeSection; label: string }[] = [
  { key: 'term1', label: '1ви срок' },
  { key: 'term1Final', label: 'Срочна 1ви' },
  { key: 'term2', label: '2ри срок' },
  { key: 'term2Final', label: 'Срочна 2ри' },
  { key: 'yearly', label: 'Годишна' },
]

export function ClassTeacherPanel() {
  const { currentUser, absences, notes, grades, users, toggleAbsenceExcused } = useApp()
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentUser?.subjectIds?.[0] ?? '')
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)
  const [activeAbsence, setActiveAbsence] = useState<Absence | null>(null)

  const classId = currentUser?.classTeacherOf
  if (!classId) {
    return (
      <Card className="mx-auto max-w-md p-10 text-center text-muted-foreground">
        Не сте класен ръководител на паралелка.
      </Card>
    )
  }

  const klass = classById(classId)
  const students = studentsOfClass(classId, users)
  const timeline = [
    ...notes.filter((n) => students.some((s) => s.id === n.studentId)).map((n) => ({ type: 'note' as const, date: n.date, data: n })),
    ...grades.filter((g) => students.some((s) => s.id === g.studentId)).map((g) => ({ type: 'grade' as const, date: g.date, data: g })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 24)

  const subjectOptions = useMemo(() => {
    const ids = new Set(grades.map((g) => g.subjectId).concat(notes.map((n) => n.subjectId)))
    return Array.from(ids).map((id) => subjectById(id))
  }, [grades, notes])

  const selectedSubject = subjectOptions.find((s) => s.id === selectedSubjectId) ?? subjectOptions[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></div>
        <div>
          <h2 className="font-heading text-xl font-bold">Панел на класен ръководител — {klass?.name} клас</h2>
          <p className="text-sm text-muted-foreground">{students.length} ученици · Учебна 2025/2026 г.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-3">
        <div className="text-sm text-muted-foreground">Таблицата показва оценките, бележките и отсъствията за целия клас.</div>
        <div className="relative">
          <button type="button" onClick={() => setSubjectMenuOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
            <BookOpenCheck className="size-4 text-primary" /> Оценки - {selectedSubject?.name ?? 'Предмет'}
            <ChevronDown className={cn('size-4 transition-transform', subjectMenuOpen && 'rotate-180')} />
          </button>
          {subjectMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
              {subjectOptions.map((subject) => (
                <button key={subject.id} type="button" onClick={() => { setSelectedSubjectId(subject.id); setSubjectMenuOpen(false) }} className="flex w-full items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                  <span className="font-medium">{subject.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ученик</th>
                <th className="px-4 py-3">Оценки</th>
                <th className="px-4 py-3">Бележки</th>
                <th className="px-4 py-3">Отсъствия</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id && g.subjectId === selectedSubjectId)
                const studentNotes = notes.filter((n) => n.studentId === student.id && n.subjectId === selectedSubjectId)
                const studentAbsences = absences.filter((a) => a.studentId === student.id && a.subjectId === selectedSubjectId)
                return (
                  <tr key={student.id} className="border-t border-border/70 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{student.number}. {student.name}</div>
                      <div className="text-xs text-muted-foreground">{klass?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid gap-2 xl:grid-cols-5">
                        {gradeSections.map((section) => {
                          const sectionGrades = studentGrades.filter((g) => g.section === section.key)
                          return (
                            <div key={section.key} className="rounded-lg border border-border/70 bg-muted/30 p-2">
                              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</div>
                              <div className="space-y-1">
                                {sectionGrades.map((g) => (
                                  <div key={g.id} className="flex items-center gap-1 rounded-md border border-border/70 bg-background/80 px-2 py-1">
                                    <GradePill value={g.value} className="size-6 text-[0.65rem]" />
                                  </div>
                                ))}
                                {sectionGrades.length === 0 && <span className="text-[11px] text-muted-foreground">Няма</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {studentNotes.map((note) => (
                          <div key={note.id} className="rounded-lg border border-border/70 bg-muted/30 px-2 py-2 text-xs">
                            <div className="mb-1 flex items-center justify-between">
                              <Badge variant={note.kind === 'praise' ? 'green' : 'warning'}>{note.kind === 'praise' ? 'Похвала' : 'Забележка'}</Badge>
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{note.date}</span>
                            </div>
                            <div>{note.text}</div>
                          </div>
                        ))}
                        {studentNotes.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {studentAbsences.map((absence) => (
                          <button key={absence.id} type="button" onClick={() => setActiveAbsence(absence)} className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2 py-2 text-left text-xs">
                            <span className="text-danger">Отсъствие</span>
                            <Badge tone={absence.excused ? 'success' : 'danger'}>{absence.excused ? 'Извинено' : 'Неизвинено'}</Badge>
                          </button>
                        ))}
                        {studentAbsences.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(activeAbsence)} onClose={() => setActiveAbsence(null)} title="Отсъствия на ученика">
        {activeAbsence && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <div className="font-semibold">{userById(activeAbsence.studentId, users)?.name}</div>
              <div className="mt-1 text-muted-foreground">{subjectById(activeAbsence.subjectId).name} · {activeAbsence.date} · {activeAbsence.time ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Статус</div>
              <div className="mt-1">{activeAbsence.excused ? 'Извинено' : 'Неизвинено'} · Отсъствие</div>
            </div>
            {(currentUser?.role === 'admin' || currentUser?.classTeacherOf === classId) && !activeAbsence.excused && (
              <div className="flex justify-end">
                <Button onClick={() => { toggleAbsenceExcused(activeAbsence.id); setActiveAbsence(null) }}>Извини</Button>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Хронология на класа</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l border-border pl-6">
            {timeline.map((item, i) => {
              const student = userById(item.data.studentId, users)
              if (item.type === 'note') {
                const n = item.data
                return (
                  <li key={`n${i}`} className="relative">
                    <span className={`absolute -left-[1.7rem] flex size-5 items-center justify-center rounded-full ${n.kind === 'praise' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                      {n.kind === 'praise' ? <ThumbsUp className="size-3" /> : <AlertTriangle className="size-3" />}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{student?.name}</span>
                      <Badge variant={n.kind === 'praise' ? 'green' : 'danger'}>{subjectById(n.subjectId).abbr}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(n.date)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.text}</p>
                  </li>
                )
              }
              const g = item.data
              return (
                <li key={`g${i}`} className="relative">
                  <span className="absolute -left-[1.75rem] flex size-5 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue text-[0.6rem] font-bold">{g.value}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{student?.name}</span>
                    <Badge variant="blue">{subjectById(g.subjectId).abbr}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(g.date)}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">Нанесена оценка <GradePill value={g.value} className="size-6 text-xs" /></p>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
