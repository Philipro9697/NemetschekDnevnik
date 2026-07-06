'use client'

import { useApp } from '@/components/app-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { GradePill } from '@/components/shared/grade-pill'
import {
  studentsOfClass,
  classById,
  subjectById,
  userById,
  formatDate,
} from '@/lib/data'
import { ThumbsUp, AlertTriangle, GraduationCap } from 'lucide-react'

export function ClassTeacherPanel() {
  const { currentUser, absences, notes, grades, users } = useApp()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></div>
        <div>
          <h2 className="font-heading text-xl font-bold">Панел на класен ръководител — {klass?.name} клас</h2>
          <p className="text-sm text-muted-foreground">{students.length} ученици · Учебна 2025/2026 г.</p>
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
                <th className="px-4 py-3">Закъснения</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id).slice(0, 5)
                const studentNotes = notes.filter((n) => n.studentId === student.id).slice(0, 2)
                const studentAbsences = absences.filter((a) => a.studentId === student.id)
                return (
                  <tr key={student.id} className="border-t border-border/70 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} className="size-8 text-[0.65rem]" />
                        <div>
                          <div className="font-medium">{student.number}. {student.name}</div>
                          <div className="text-xs text-muted-foreground">{klass?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {studentGrades.map((g) => <GradePill key={g.id} value={g.value} className="size-7 text-xs" />)}
                        {studentGrades.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {studentNotes.map((note) => (
                          <div key={note.id} className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-xs">{note.text}</div>
                        ))}
                        {studentNotes.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge tone="danger" title={`Неизвинени отсъствия: ${studentAbsences.filter((a) => a.type === 'absent' && !a.excused).length}`}>
                          {studentAbsences.filter((a) => a.type === 'absent' && !a.excused).length}
                        </Badge>
                        <span className="text-muted-foreground">отсъствия</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge tone="warning" title={`Закъснения: ${studentAbsences.filter((a) => a.type === 'late').length}`}>
                          {studentAbsences.filter((a) => a.type === 'late').length}
                        </Badge>
                        <span className="text-muted-foreground">закъснения</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

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
