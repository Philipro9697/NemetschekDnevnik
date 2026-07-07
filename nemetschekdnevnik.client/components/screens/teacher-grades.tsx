'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, GraduationCap, Sparkles, Plus, ChevronDown, CircleAlert, MessageSquareText, BookOpenCheck, CalendarRange } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { GradePill } from '@/components/shared/grade-pill'
import { classes, classById, studentsOfClass, subjectById, userById, type Absence, type Grade, type GradeSection } from '@/lib/data'

const gradeSections: { key: GradeSection; label: string }[] = [
  { key: 'term1', label: '1ви срок' },
  { key: 'term1Final', label: 'Срочна 1ви' },
  { key: 'term2', label: '2ри срок' },
  { key: 'term2Final', label: 'Срочна 2ри' },
  { key: 'yearly', label: 'Годишна' },
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
  const [absenceType, setAbsenceType] = useState<'absent' | 'late'>('absent')
  const [absenceExcused, setAbsenceExcused] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null)

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
    setAbsenceType('absent')
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
      type: absenceType,
      excused: absenceExcused,
      time: currentTime(),
    })
    setAbsenceTarget(null)
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
                      <div className="text-xs text-muted-foreground">{classById(student.classId)?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid gap-2 xl:grid-cols-5">
                        {gradeSections.map((section) => {
                          const sectionGrades = studentGrades.filter((g) => g.section === section.key)
                          return (
                            <div key={section.key} className="rounded-lg border border-border/70 bg-muted/30 p-2">
                              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                <span>{section.label}</span>
                                <button type="button" onClick={() => openGradeDialog(student.id, section.key)} className="rounded-md p-1 text-primary hover:bg-background">
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <div className="space-y-1">
                                {sectionGrades.map((g) => (
                                  <button key={g.id} type="button" onClick={() => setSelectedGrade(g)} className="flex w-full items-center justify-between rounded-md border border-border/70 bg-background/80 px-2 py-1 text-left">
                                    <GradePill value={g.value} className="size-6 text-[0.65rem]" />
                                    <span className="text-[11px] text-muted-foreground">{g.description?.slice(0, 18) ?? ''}</span>
                                  </button>
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
                        <button type="button" onClick={() => openNoteDialog(student.id)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          <Plus className="size-3.5" /> Добави бележка
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {studentAbsences.map((absence) => (
                          <button key={absence.id} type="button" onClick={() => setSelectedAbsence(absence)} className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2 py-2 text-left text-xs">
                            <span className={cn(absence.type === 'absent' ? 'text-danger' : 'text-warning')}>{absence.type === 'absent' ? 'Отсъствие' : 'Закъснение'}</span>
                            <Badge tone={absence.excused ? 'success' : 'danger'}>{absence.excused ? 'Извинено' : 'Неизвинено'}</Badge>
                          </button>
                        ))}
                        {studentAbsences.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                        <button type="button" onClick={() => openAbsenceDialog(student.id)} className="inline-flex items-center gap-1.5 text-sm font-medium text-danger">
                          <Plus className="size-3.5" /> Добави отсъствие
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
            <select value={gradeValue} onChange={(e) => setGradeValue(Number(e.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {[2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
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
          <div className="flex gap-2">
            <Button variant={absenceType === 'absent' ? 'default' : 'outline'} onClick={() => setAbsenceType('absent')}>Отсъствие</Button>
            <Button variant={absenceType === 'late' ? 'default' : 'outline'} onClick={() => setAbsenceType('late')}>Закъснение</Button>
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
              <GradePill value={selectedGrade.value} className="size-8 text-sm" />
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

      <Dialog open={Boolean(selectedAbsence)} onClose={() => setSelectedAbsence(null)} title="Детайли за отсъствие">
        {selectedAbsence && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Ученик</div>
              <div className="font-semibold">{userById(selectedAbsence.studentId, users)?.name}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Дата и час</div>
              <div>{selectedAbsence.date} · {selectedAbsence.time ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Учител</div>
              <div>{userById(selectedAbsence.teacherId ?? '', users)?.name ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Предмет</div>
              <div>{subjectById(selectedAbsence.subjectId).name}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Статус</div>
              <div>{selectedAbsence.excused ? 'Извинено' : 'Неизвинено'} · {selectedAbsence.type === 'absent' ? 'Отсъствие' : 'Закъснение'}</div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
