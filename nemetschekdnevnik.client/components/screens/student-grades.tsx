'use client'

import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GradePill } from '@/components/shared/grade-pill'
import { classById, formatDate, subjects, type User } from '@/lib/data'
import { TrendingUp, Sparkles } from 'lucide-react'

export function StudentGrades({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? app.currentUser
  if (!me) return null

  const myGrades = app.grades.filter((g) => g.studentId === me.id)
  const avg =
    myGrades.length > 0
      ? (myGrades.reduce((a, g) => a + g.value, 0) / myGrades.length).toFixed(2)
      : '—'

  const gradesBySubject = subjects
    .map((subject) => ({
      subject,
      grades: myGrades
        .filter((g) => g.subjectId === subject.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    }))
    .filter((row) => row.grades.length > 0)

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Оценки
            </div>
            <h2 className="font-heading text-2xl font-bold">Оценките на {me.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {classById(me.classId)?.name ?? 'Без клас'} · среден успех {avg}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <TrendingUp className="size-4 text-primary" /> Среден успех
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-primary">{avg}</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/10">
        <CardHeader>
          <CardTitle>Оценки по предмети</CardTitle>
          <p className="text-sm text-muted-foreground">Оценките са подредени по предмети и са видими в реално време.</p>
        </CardHeader>
        <CardBody className="space-y-3">
          {gradesBySubject.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Все още няма оценки.</p>
          ) : (
            gradesBySubject.map(({ subject, grades }) => {
              const subjAvg = (grades.reduce((a, g) => a + g.value, 0) / grades.length).toFixed(2)
              return (
                <div key={subject.id} className="rounded-2xl border border-border/70 bg-muted/30 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">Среден успех: {subjAvg}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {grades.map((g) => (
                        <GradePill key={g.id} value={g.value} title={formatDate(g.date)} />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardBody>
      </Card>
    </div>
  )
}
