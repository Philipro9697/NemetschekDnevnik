'use client'

import { useState } from 'react'
import { FileText, Check, Star, Smile, Meh, Frown, Sparkles, CalendarDays } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { GradePill } from '@/components/shared/grade-pill'
import {
  studentsOfClass,
  subjectById,
  classById,
  type Lesson,
  type User,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export function ClassDiary({ lesson }: { lesson: Lesson }) {
  const { currentUser, grades, absences, notes, addGrade, addAbsence, addNote } = useApp()
  const students = studentsOfClass(lesson.classId)
  const subject = subjectById(lesson.subjectId)
  const klass = classById(lesson.classId)

  const [gradeFor, setGradeFor] = useState<User | null>(null)
  const [noteFor, setNoteFor] = useState<User | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  const isPrimaryClass = lesson.classId === 'c5a' || lesson.classId === 'c5b' || lesson.classId === 'c6b'

  function dayAbsence(studentId: string) {
    return absences.find(
      (a) =>
        a.studentId === studentId &&
        a.subjectId === lesson.subjectId &&
        a.date === today &&
        a.type === 'absent',
    )
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-primary p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold">{klass?.name} клас</h2>
            <Badge variant="green">Текущ час</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {subject.name} · {lesson.period}. час · Стая {lesson.room}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 text-primary" /> Днес: {today}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="size-3.5" /> Бързо въвеждане
          </div>
        </div>
        <div className="hidden grid-cols-[2.5rem_1fr_9rem_5rem_3rem] items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
          <span>№</span>
          <span>Ученик</span>
          <span className="text-center">Отсъствия</span>
          <span className="text-center">Оценки</span>
          <span className="text-center">Бел.</span>
        </div>
        <ul className="divide-y divide-border">
          {students.map((s) => {
            const absent = dayAbsence(s.id)
            const studentGrades = grades.filter(
              (g) => g.studentId === s.id && g.subjectId === lesson.subjectId,
            )
            const noteCount = notes.filter(
              (n) => n.studentId === s.id && n.subjectId === lesson.subjectId,
            ).length
            return (
              <li
                key={s.id}
                className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-[2.5rem_1fr_9rem_5rem_3rem]"
              >
                <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                  {s.number}
                </span>
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground sm:hidden">{s.number}. </span>
                  {s.name}
                </span>

                {/* Absences */}
                <div className="flex items-center gap-2 sm:justify-center">
                  <button
                    onClick={() =>
                      !absent &&
                      addAbsence({
                        studentId: s.id,
                        subjectId: lesson.subjectId,
                        type: 'absent',
                        excused: false,
                      })
                    }
                    aria-label="Отсъствие"
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                      absent
                        ? 'border-danger bg-danger text-danger-foreground'
                        : 'border-danger/40 text-danger hover:bg-danger/10',
                    )}
                  >
                    О
                  </button>
                </div>

                {/* Grades */}
                <div className="flex items-center gap-1.5 sm:justify-center">
                  {studentGrades.slice(-2).map((g) => (
                    <GradePill key={g.id} value={g.value} className="size-7 text-xs" />
                  ))}
                  <button
                    onClick={() => setGradeFor(s)}
                    aria-label="Добави оценка"
                    className="flex size-8 items-center justify-center rounded-lg border-2 border-brand-blue/50 text-lg font-bold text-brand-blue transition-colors hover:bg-brand-blue/10"
                  >
                    +
                  </button>
                </div>

                {/* Note */}
                <div className="flex items-center sm:justify-center">
                  <button
                    onClick={() => setNoteFor(s)}
                    aria-label="Добави бележка"
                    className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <FileText className="size-5" />
                    {noteCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                        {noteCount}
                      </span>
                    )}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {gradeFor && (
        <GradeDialog
          student={gradeFor}
          onClose={() => setGradeFor(null)}
          onPick={(value) => {
            addGrade({
              studentId: gradeFor.id,
              subjectId: lesson.subjectId,
              teacherId: currentUser!.id,
              value,
              kind: 'oral',
            })
            setGradeFor(null)
          }}
          isPrimaryClass={isPrimaryClass}
        />
      )}

      {noteFor && (
        <NoteDialog
          student={noteFor}
          onClose={() => setNoteFor(null)}
          onSave={(text, kind) => {
            addNote({
              studentId: noteFor.id,
              subjectId: lesson.subjectId,
              teacherId: currentUser!.id,
              text,
              kind,
            })
            setNoteFor(null)
          }}
        />
      )}
    </div>
  )
}

function GradeDialog({
  student,
  onClose,
  onPick,
  isPrimaryClass,
}: {
  student: User
  onClose: () => void
  onPick: (v: number) => void
  isPrimaryClass: boolean
}) {
  const primaryOptions = [
    { value: 6, icon: Star, label: 'Отлично' },
    { value: 5, icon: Smile, label: 'Добре' },
    { value: 4, icon: Meh, label: 'Средно' },
    { value: 3, icon: Frown, label: 'Нужно е' },
  ]

  return (
    <Dialog open onClose={onClose} title="Нанеси оценка" description={student.name}>
      <div className={cn('grid gap-2', isPrimaryClass ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-5')}>
        {(isPrimaryClass ? primaryOptions : [2, 3, 4, 5, 6]).map((option) => {
          const value = typeof option === 'number' ? option : option.value
          const Icon = typeof option === 'number' ? null : option.icon
          return (
            <button
              key={value}
              onClick={() => onPick(value)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border py-4 transition-colors hover:border-primary hover:bg-primary/5"
            >
              {isPrimaryClass && Icon ? (
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
              ) : (
                <GradePill value={value} className="size-11 text-lg" />
              )}
              {isPrimaryClass && typeof option !== 'number' && (
                <span className="text-xs font-medium text-muted-foreground">{option.label}</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Оценката се записва веднага и се появява в профила на ученика и родителя.
      </p>
    </Dialog>
  )
}

function NoteDialog({
  student,
  onClose,
  onSave,
}: {
  student: User
  onClose: () => void
  onSave: (text: string, kind: 'praise' | 'remark') => void
}) {
  const [text, setText] = useState('')
  const [kind, setKind] = useState<'praise' | 'remark'>('praise')
  return (
    <Dialog open onClose={onClose} title="Бележка / Похвала" description={student.name}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setKind('praise')}
          className={cn(
            'rounded-xl border-2 py-2.5 text-sm font-medium transition-colors',
            kind === 'praise'
              ? 'border-success bg-success/10 text-success'
              : 'border-border text-muted-foreground',
          )}
        >
          Похвала
        </button>
        <button
          onClick={() => setKind('remark')}
          className={cn(
            'rounded-xl border-2 py-2.5 text-sm font-medium transition-colors',
            kind === 'remark'
              ? 'border-danger bg-danger/10 text-danger'
              : 'border-border text-muted-foreground',
          )}
        >
          Забележка
        </button>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Опиши бележката или похвалата..."
        className="min-h-28"
        autoFocus
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Отказ
        </Button>
        <Button disabled={!text.trim()} onClick={() => onSave(text.trim(), kind)}>
          <Check className="size-4" /> Запиши
        </Button>
      </div>
    </Dialog>
  )
}
