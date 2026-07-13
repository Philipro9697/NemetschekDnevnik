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

const termGroups = [
  { key: 'term1', label: '1ви срок', sections: ['term1', 'term1Final'] as GradeSection[] },
  { key: 'term2', label: '2ри срок', sections: ['term2', 'term2Final'] as GradeSection[] },
  { key: 'yearly', label: 'Годишна', sections: ['yearly'] as GradeSection[] },
]



  function getGradeColumnWidth(sectionKey: GradeSection) {
    return sectionKey === 'term1Final' || sectionKey === 'term2Final' || sectionKey === 'yearly' ? '40px' : '160px'
  }

  

export function ClassTeacherPanel() {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const { currentUser, absences, notes, grades, users, toggleAbsenceExcused } = useApp()
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentUser?.subjectIds?.[0] ?? '')
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)
  const [activeAbsence, setActiveAbsence] = useState<Absence | null>(null)
  const [notesPopupTarget, setNotesPopupTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
  const [absencesPopupTarget, setAbsencesPopupTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
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

  function toggleGroup(groupKey: string) {
      setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
    }
    const visibleSections = useMemo(() => {
      return gradeSections.filter((section) => {
        const group = termGroups.find((item) => item.sections.includes(section.key))
        return !group || !collapsedGroups[group.key]
      })
    }, [collapsedGroups])
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
        <div className="flex flex-wrap gap-2 border-b border-border/70 bg-muted/30 px-3 py-2">
          {termGroups.map((group) => {
            const collapsed = Boolean(collapsedGroups[group.key])
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
                  collapsed ? 'border-border bg-background text-muted-foreground' : 'border-primary/30 bg-primary/10 text-primary',
                )}
              >
                <span>{group.label}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', !collapsed && 'rotate-180')} />
              </button>
            )
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-[220px] px-3 py-2">Ученик</th>
                {visibleSections.map((section) => (
                  <th key={section.key} className="border-l border-border/70 px-1.5 py-2 text-center" style={{ width: getGradeColumnWidth(section.key), minWidth: getGradeColumnWidth(section.key) }}>
                    <div className="text-[9px] font-semibold uppercase tracking-wide">{section.label}</div>
                  </th>
                ))}
                <th className="w-[70px] border-l border-border/70 px-2 py-2">Бележки</th>
                <th className="w-[70px] border-l border-border/70 px-2 py-2">Отсъствия</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id && g.subjectId === selectedSubjectId)
                const studentNotes = notes.filter((n) => n.studentId === student.id && n.subjectId === selectedSubjectId)
                const studentAbsences = absences.filter((a) => a.studentId === student.id && a.subjectId === selectedSubjectId)
                
                return (
                  <tr key={student.id} className="border-t border-border/70 align-top">
                    {/* 1. Student Info Column */}
                    <td className="px-4 py-3">
                      <div className="font-medium">{student.number}. {student.name}</div>
                      <div className="text-xs text-muted-foreground">{klass?.name}</div>
                    </td>

                    {/* 2. Grade Section Columns (Rendered directly as table cells) */}
                    {visibleSections.map((section) => {
                      const sectionGrades = studentGrades.filter((g) => g.section === section.key)
                      return (
                        <td 
                          key={section.key} 
                          className="border-l border-border/70 px-1.5 py-1.5 align-top" 
                          style={{ width: getGradeColumnWidth(section.key), minWidth: getGradeColumnWidth(section.key) }}
                        >
                          <div className="flex flex-wrap gap-1">
                            {sectionGrades.map((g) => (
                              <button key={g.id} type="button" onClick={() => setSelectedGrade(g)} className="rounded-md border border-border/70 bg-background/80 p-0.5">
                                <GradePill value={g.value} className="size-6 text-xs" classId={student.classId} />
                              </button>
                            ))}
                            {sectionGrades.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
                          </div>
                        </td>
                      )
                    })}

                    {/* 3. Notes Column */}
                    <td className="border-l border-border/70 px-2 py-2 align-top">
                      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
                        <button type="button" onClick={() => setNotesPopupTarget({ studentId: student.id, subjectId: selectedSubjectId })} className="rounded-md px-2 py-1 text-sm font-semibold text-foreground hover:bg-background">
                          {studentNotes.length}
                        </button>
                      </div>
                    </td>

                    {/* 4. Absences Column */}
                    <td className="border-l border-border/70 px-2 py-2 align-top">
                      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
                        <button type="button" onClick={() => setAbsencesPopupTarget({ studentId: student.id, subjectId: selectedSubjectId })} className="rounded-md px-2 py-1 text-sm font-semibold text-danger hover:bg-background">
                          {studentAbsences.length}
                        </button>
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
      
      <Dialog open={Boolean(notesPopupTarget)} onClose={() => setNotesPopupTarget(null)} title="Бележки">
        {notesPopupTarget && (
          <div className="space-y-2 text-sm">
            {notes.filter((note) => note.studentId === notesPopupTarget.studentId && note.subjectId === notesPopupTarget.subjectId).length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-muted-foreground">Няма бележки.</div>
            ) : (
              notes.filter((note) => note.studentId === notesPopupTarget.studentId && note.subjectId === notesPopupTarget.subjectId).map((note) => (
                <div key={note.id} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge variant={note.kind === 'praise' ? 'green' : 'warning'}>{note.kind === 'praise' ? 'Похвала' : 'Забележка'}</Badge>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{note.date} · {note.time ?? '—'}</span>
                  </div>
                  <div className="text-sm">{note.text}</div>
                </div>
              ))
            )}
          </div>
        )}
      </Dialog>
      
      <Dialog open={Boolean(absencesPopupTarget)} onClose={() => setAbsencesPopupTarget(null)} title="Отсъствия">
        {absencesPopupTarget && (
          <div className="space-y-2 text-sm">
            {absences.filter((absence) => absence.studentId === absencesPopupTarget.studentId && absence.subjectId === absencesPopupTarget.subjectId).length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-muted-foreground">Няма отсъствия.</div>
            ) : (
              absences.filter((absence) => absence.studentId === absencesPopupTarget.studentId && absence.subjectId === absencesPopupTarget.subjectId).map((absence) => (
                <div key={absence.id} className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-danger">Отсъствие</span>
                    <Badge tone={absence.excused ? 'success' : 'danger'}>{absence.excused ? 'Извинено' : 'Неизвинено'}</Badge>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{absence.date} · {absence.time ?? '—'}</div>
                </div>
              ))
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
