'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, GraduationCap, Sparkles, Plus, ChevronDown, CircleAlert, MessageSquareText, BookOpenCheck, CalendarRange, Star, Heart, ThumbsUp, Frown, X } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { GradePill, getGradeIcon } from '@/components/shared/grade-pill'
import { classes, classById, studentsOfClass, subjects, subjectById, userById, type Grade, type GradeSection } from '@/lib/data'
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

function currentTime() {
  return new Date().toTimeString().slice(0, 5)
}

export function TeacherGrades() {
  const { currentUser, users, grades, absences, notes, selectedClassId, setSelectedClass, addGrade, addAbsence, addNote } = useApp()
  const [query, setQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentUser?.subjectIds?.[0] ?? '')
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)
  const [gradeTarget, setGradeTarget] = useState<{ studentId: string; subjectId: string; section: GradeSection } | null>(null)
  const [noteTarget, setNoteTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
  const [absenceTarget, setAbsenceTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
  const [gradeValue, setGradeValue] = useState(5)
  const [gradeDescription, setGradeDescription] = useState('')
  const [noteKind, setNoteKind] = useState<'praise' | 'remark'>('praise')
  const [noteText, setNoteText] = useState('')
  const [absenceExcused, setAbsenceExcused] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [notesPopupTarget, setNotesPopupTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
  const [absencesPopupTarget, setAbsencesPopupTarget] = useState<{ studentId: string; subjectId: string } | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const classId = selectedClassId ?? currentUser?.classTeacherOf ?? classes[0]?.id

  useEffect(() => {
    if (currentUser?.subjectIds && !currentUser.subjectIds.includes(selectedSubjectId)) {
      setSelectedSubjectId(currentUser.subjectIds[0] ?? '')
    }
  }, [currentUser?.subjectIds, selectedSubjectId])

  const subjectOptions = useMemo(() => subjects.filter((s) => currentUser?.subjectIds?.includes(s.id)), [currentUser?.subjectIds])

  const students = useMemo(() => {
    const list = studentsOfClass(classId, users)
    return query.trim()
      ? list.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
      : list
  }, [classId, query, users])

  const selectedSubject = subjectOptions.find((s) => s.id === selectedSubjectId) ?? subjectOptions[0]
  const visibleSections = useMemo(() => {
    return gradeSections.filter((section) => {
      const group = termGroups.find((item) => item.sections.includes(section.key))
      return !group || !collapsedGroups[group.key]
    })
  }, [collapsedGroups])

  function getGradeColumnWidth(sectionKey: GradeSection) {
    return sectionKey === 'term1Final' || sectionKey === 'term2Final' || sectionKey === 'yearly' ? '84px' : '96px'
  }

  function openGradeDialog(studentId: string, section: GradeSection) {
    setGradeTarget({ studentId, subjectId: selectedSubjectId, section })
    setGradeValue(5)
    setGradeDescription('')
  }

  function openNoteDialog(studentId: string) {
    setNoteTarget({ studentId, subjectId: selectedSubjectId })
    setNoteText('')
    setNoteKind('praise')
  }

  function openAbsenceDialog(studentId: string) {
    setAbsenceTarget({ studentId, subjectId: selectedSubjectId })
    setAbsenceExcused(false)
  }

  function handleSubmitGrade() {
    if (!gradeTarget || !currentUser || !selectedSubjectId) return
    addGrade({
      studentId: gradeTarget.studentId,
      subjectId: selectedSubjectId,
      teacherId: currentUser.id,
      value: gradeValue,
      kind: 'oral',
      section: gradeTarget.section,
      description: gradeDescription.trim(),
      time: currentTime(),
    })
    setGradeTarget(null)
  }

  function handleSubmitNote() {
    if (!noteTarget || !currentUser) return
    addNote({
      studentId: noteTarget.studentId,
      subjectId: noteTarget.subjectId,
      teacherId: currentUser.id,
      text: noteText.trim(),
      kind: noteKind,
      time: currentTime(),
    })
    setNoteTarget(null)
  }

  function handleSubmitAbsence() {
    if (!absenceTarget || !currentUser) return
    addAbsence({
      studentId: absenceTarget.studentId,
      subjectId: absenceTarget.subjectId,
      teacherId: currentUser.id,
      type: 'absent',
      excused: absenceExcused,
      time: currentTime(),
    })
    setAbsenceTarget(null)
  }

  function toggleGroup(groupKey: string) {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <GraduationCap className="size-3.5" /> Дневник
            </div>
            <h2 className="font-heading text-2xl font-bold">Управление на оценки, бележки и отсъствия</h2>
            <p className="mt-1 text-sm text-muted-foreground">Избери клас и предмет, след което редактирай таблицата за всеки ученик.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {classes.map((klass) => (
              <Button key={klass.id} variant={classId === klass.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedClass(klass.id)}>
                {klass.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" /> Преглед за {classById(classId)?.name ?? 'клас'}
        </div>
        <div className="flex items-center gap-3">
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
          <div className="text-sm text-muted-foreground">Общо ученици: {students.length}</div>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Търси ученик" className="pl-9" />
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
                <th className="w-[130px] border-l border-border/70 px-2 py-2">Бележки</th>
                <th className="w-[130px] border-l border-border/70 px-2 py-2">Отсъствия</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id && g.subjectId === selectedSubjectId)
                const studentNotes = notes.filter((n) => n.studentId === student.id && n.subjectId === selectedSubjectId)
                const studentAbsences = absences.filter((a) => a.studentId === student.id && a.subjectId === selectedSubjectId)
                return (
                  <tr key={student.id} className="border-t border-border/70 align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium text-[13px]">{student.number}. {student.name}</div>
                      <div className="text-[11px] text-muted-foreground">{classById(student.classId)?.name}</div>
                    </td>
                    {visibleSections.map((section) => {
                      const sectionGrades = studentGrades.filter((g) => g.section === section.key)
                      return (
                        <td key={section.key} className="border-l border-border/70 px-1.5 py-1.5 align-top" style={{ width: getGradeColumnWidth(section.key), minWidth: getGradeColumnWidth(section.key) }}>
                          <div className="rounded-md border border-border/70 bg-muted/20 p-1.5">
                            <div className="mb-1 flex items-center justify-end text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              <button type="button" onClick={() => openGradeDialog(student.id, section.key)} className="rounded-md p-0.5 text-primary hover:bg-background">
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {sectionGrades.map((g) => (
                                <button key={g.id} type="button" onClick={() => setSelectedGrade(g)} className="rounded-md border border-border/70 bg-background/80 p-0.5">
                                  <GradePill value={g.value} className="size-6 text-xs" classId={student.classId} />
                                </button>
                              ))}
                              {sectionGrades.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="border-l border-border/70 px-2 py-2 align-top">
                      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
                        <button type="button" onClick={() => setNotesPopupTarget({ studentId: student.id, subjectId: selectedSubjectId })} className="rounded-md px-2 py-1 text-sm font-semibold text-foreground hover:bg-background">
                          {studentNotes.length}
                        </button>
                        <button type="button" onClick={() => openNoteDialog(student.id)} className="rounded-md p-1 text-primary hover:bg-background">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="border-l border-border/70 px-2 py-2 align-top">
                      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
                        <button type="button" onClick={() => setAbsencesPopupTarget({ studentId: student.id, subjectId: selectedSubjectId })} className="rounded-md px-2 py-1 text-sm font-semibold text-danger hover:bg-background">
                          {studentAbsences.length}
                        </button>
                        <button type="button" onClick={() => openAbsenceDialog(student.id)} className="rounded-md p-1 text-danger hover:bg-background">
                          <Plus className="size-3.5" />
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

      <Dialog open={Boolean(gradeTarget)} onClose={() => setGradeTarget(null)} title="Добави оценка">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">{selectedSubject?.name ?? 'Предмет'}</div>
            <div className="mt-1">Избери стойност и кратко описание за оценката.</div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Оценка</label>
            {['c1a', 'c2a', 'c2b'].includes(classId) ? (
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 6, icon: Star, label: 'Отлично' },
                  { value: 5, icon: Heart, label: ' Много добър' },
                  { value: 4, icon: ThumbsUp, label: 'Добър' },
                  { value: 3, icon: Frown, label: 'Среден' },
                  { value: 2, icon: X, label: 'Слаб' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setGradeValue(value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors',
                      gradeValue === value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <Icon className="size-6 text-primary" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <select value={gradeValue} onChange={(e) => setGradeValue(Number(e.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {[2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Описание</label>
            <Input value={gradeDescription} onChange={(e) => setGradeDescription(e.target.value)} placeholder="Напр. Контролно по дроби" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGradeTarget(null)}>Връщане назад</Button>
            <Button onClick={handleSubmitGrade}>Добави оценка</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={Boolean(noteTarget)} onClose={() => setNoteTarget(null)} title="Добави бележка">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {noteTarget && (
              <>
                <div className="font-semibold text-foreground">{userById(noteTarget.studentId, users)?.name}</div>
                <div className="mt-1">{userById(noteTarget.studentId, users)?.number ? `${userById(noteTarget.studentId, users)?.number}. номер` : ''}</div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant={noteKind === 'praise' ? 'default' : 'outline'} onClick={() => setNoteKind('praise')}>Похвала</Button>
            <Button variant={noteKind === 'remark' ? 'default' : 'outline'} onClick={() => setNoteKind('remark')}>Забележка</Button>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Описание</label>
            <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Опиши бележката" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteTarget(null)}>Връщане назад</Button>
            <Button onClick={handleSubmitNote}>Добави бележка</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={Boolean(absenceTarget)} onClose={() => setAbsenceTarget(null)} title="Добави отсъствие">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            {absenceTarget && (
              <>
                <div className="font-semibold text-foreground">{userById(absenceTarget.studentId, users)?.name}</div>
                <div className="mt-1">{userById(absenceTarget.studentId, users)?.number ? `${userById(absenceTarget.studentId, users)?.number}. номер` : ''}</div>
              </>
            )}
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Ще се добави отсъствие за ученика.
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={absenceExcused} onChange={(e) => setAbsenceExcused(e.target.checked)} />
            Извинено
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAbsenceTarget(null)}>Връщане назад</Button>
            <Button onClick={handleSubmitAbsence}>Добави отсъствие</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={Boolean(selectedGrade)} onClose={() => setSelectedGrade(null)} title="Детайли за оценка">
        {selectedGrade && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="font-semibold">{userById(selectedGrade.studentId, users)?.name}</div>
              <GradePill value={selectedGrade.value} className="size-8 text-sm" classId={userById(selectedGrade.studentId, users)?.classId} />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Дата и час</div>
              <div>{selectedGrade.date} · {selectedGrade.time ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Учител</div>
              <div>{userById(selectedGrade.teacherId, users)?.name}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Предмет</div>
              <div>{subjectById(selectedGrade.subjectId).name}</div>
            </div>
            {selectedGrade.description && <div className="rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground">{selectedGrade.description}</div>}
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
