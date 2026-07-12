'use client'

import { useApp } from '@/components/app-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { GradePill } from '@/components/shared/grade-pill'
import { subjects, subjectById, classById, formatDate, type User } from '@/lib/data'
import { ThumbsUp, AlertTriangle } from 'lucide-react'

export function StudentProfile({ student }: { student: User }) {
  const { grades, absences, notes } = useApp()
  const myGrades = grades.filter((g) => g.studentId === student.id)
  const myAbsences = absences.filter((a) => a.studentId === student.id)
  const myNotes = notes
    .filter((n) => n.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const excused = myAbsences.filter((a) => a.excused).length
  const unexcused = myAbsences.filter((a) => !a.excused).length

  const subjectsWithGrades = subjects.filter((s) =>
    myGrades.some((g) => g.subjectId === s.id),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={student.name} className="size-14 text-base" />
        <div>
          <h2 className="font-heading text-xl font-bold">{student.name}</h2>
          <p className="text-sm text-muted-foreground">
            {classById(student.classId)?.name} клас · № {student.number}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Оценки по предмети</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjectsWithGrades.length === 0 && (
              <p className="text-sm text-muted-foreground">Все още няма нанесени оценки.</p>
            )}
            {subjectsWithGrades.map((s) => {
              const gs = myGrades.filter((g) => g.subjectId === s.id)
              const avg =
                gs.reduce((sum, g) => sum + g.value, 0) / gs.length
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="w-40 shrink-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Среден: {avg.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {gs.map((g) => (
                      <GradePill key={g.id} value={g.value} classId={student.classId} />
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отсъствия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3">
              <span className="text-sm font-medium text-success">Извинени</span>
              <span className="font-heading text-2xl font-bold text-success">{excused}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-danger/10 px-4 py-3">
              <span className="text-sm font-medium text-danger">Неизвинени</span>
              <span className="font-heading text-2xl font-bold text-danger">{unexcused}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бележки и забележки</CardTitle>
        </CardHeader>
        <CardContent>
          {myNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма записани бележки.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-6">
              {myNotes.map((n) => (
                <li key={n.id} className="relative">
                  <span
                    className={`absolute -left-[1.7rem] flex size-5 items-center justify-center rounded-full ${
                      n.kind === 'praise' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                    }`}
                  >
                    {n.kind === 'praise' ? (
                      <ThumbsUp className="size-3" />
                    ) : (
                      <AlertTriangle className="size-3" />
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatDate(n.date)}
                    </span>
                    <Badge variant={n.kind === 'praise' ? 'green' : 'danger'}>
                      {subjectById(n.subjectId).abbr}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{n.text}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
