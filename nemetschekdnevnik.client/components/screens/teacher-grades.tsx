'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GradePill } from '@/components/shared/grade-pill'
import { classes, classById, studentsOfClass, subjectById, userById, type User } from '@/lib/data'
import { Search, GraduationCap, Sparkles } from 'lucide-react'

export function TeacherGrades() {
  const { currentUser, users, grades, absences, notes, selectedClassId, setSelectedClass } = useApp()
  const [query, setQuery] = useState('')
  const classId = selectedClassId ?? currentUser?.classTeacherOf ?? classes[0]?.id

  const students = useMemo(() => {
    const list = studentsOfClass(classId, users)
    return query.trim()
      ? list.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
      : list
  }, [classId, query, users])

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <GraduationCap className="size-3.5" /> Оценки и наблюдения
            </div>
            <h2 className="font-heading text-2xl font-bold">Класни оценки, бележки, отсъствия и закъснения</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Избери клас и разгледай данните за всички ученици в един изглед.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {classes.map((klass) => (
              <Button
                key={klass.id}
                variant={classId === klass.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedClass(klass.id)}
              >
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
        <div className="text-sm text-muted-foreground">Общо ученици: {students.length}</div>
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
                <th className="px-4 py-3">Закъснения</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id)
                const studentNotes = notes.filter((n) => n.studentId === student.id)
                const studentAbsences = absences.filter((a) => a.studentId === student.id)
                const latestGrade = studentGrades[0]
                return (
                  <tr key={student.id} className="border-t border-border/70 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{classById(student.classId)?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {studentGrades.slice(0, 6).map((g) => (
                          <GradePill key={g.id} value={g.value} title={`${subjectById(g.subjectId).name} · ${g.kind}`} />
                        ))}
                        {studentGrades.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                      {latestGrade && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Последна: {subjectById(latestGrade.subjectId).name} · {latestGrade.value}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {studentNotes.slice(0, 3).map((note) => (
                          <div key={note.id} className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-xs">
                            {note.text}
                          </div>
                        ))}
                        {studentNotes.length === 0 && <span className="text-xs text-muted-foreground">Няма</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="danger">{studentAbsences.filter((a) => a.type === 'absent' && !a.excused).length}</Badge>
                        <span className="text-xs text-muted-foreground">неизвинени</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="warning">{studentAbsences.filter((a) => a.type === 'late').length}</Badge>
                        <span className="text-xs text-muted-foreground">закъснения</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
