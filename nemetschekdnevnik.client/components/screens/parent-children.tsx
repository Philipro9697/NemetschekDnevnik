'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { parentService } from '@/api/parentService'
import type { GradeDto, AbsenceDto, RemarkDto, SubjectDto } from '@/api/types'
import { Card, CardBody } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GradePill } from '@/components/shared/grade-pill'
import { cn } from '@/lib/utils'
import { ChevronRight, TrendingUp, CircleAlert, MessageSquareText } from 'lucide-react'

function classLabel(child: { classGrade: number; classLetter: string }) {
  return child.classGrade ? `${child.classGrade}${child.classLetter}` : null
}

export function ParentChildren() {
  const app = useApp()
  const children = app.apiChildren
  const { selectedChildId, setSelectedChildId } = useApp()

  const selected = children.find((c) => String(c.studentId) === selectedChildId) ?? children[0]

  const [grades, setGrades] = useState<GradeDto[]>([])
  const [absences, setAbsences] = useState<AbsenceDto[]>([])
  const [remarks, setRemarks] = useState<RemarkDto[]>([])
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(String(children[0].studentId))
    }
  }, [children, selectedChildId, setSelectedChildId])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    Promise.all([
      parentService.getChildGrades(selected.studentId),
      parentService.getChildAbsences(selected.studentId),
      parentService.getChildRemarks(selected.studentId),
      parentService.getChildSubjects(selected.studentId),
    ])
      .then(([gradesRes, absencesRes, remarksRes, subjectsRes]) => {
        setGrades(gradesRes)
        setAbsences(absencesRes)
        setRemarks(remarksRes)
        setSubjects(subjectsRes)
      })
      .catch((error) => console.error('Failed to fetch child data:', error))
      .finally(() => setLoading(false))
  }, [selected])

  if (children.length === 0) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-muted-foreground">
          Няма свързани деца към този профил.
        </CardBody>
      </Card>
    )
  }

  const unexcused = absences.filter((a) => !a.isExcused).length
  const excused = absences.filter((a) => a.isExcused).length
  const gradesBySubject = subjects
    .map((s) => ({
      subject: s,
      grades: grades
        .filter((g) => g.subjectId === s.subjectId)
        .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1)),
    }))
    .filter((row) => row.grades.length > 0)
  const orderedRemarks = [...remarks].sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1))

  return (
    <div className="space-y-6">
      {/* Child selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => {
          const active = child.studentId === selected?.studentId
          const name = `${child.firstName} ${child.lastName}`
          return (
            <button
              key={child.studentId}
              onClick={() => setSelectedChildId(String(child.studentId))}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                'border-border bg-card hover:border-primary/40 hover:shadow-sm',
              )}
            >
              <Avatar name={name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {classLabel(child) ?? 'Без клас'} клас
                </p>
              </div>
              <ChevronRight
                className={cn(
                  'size-5 text-muted-foreground transition-transform',
                  active && 'translate-x-0.5 text-primary',
                )}
              />
            </button>
          )
        })}
      </div>

      {selected && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={`${selected.firstName} ${selected.lastName}`} className="size-9" />
              <div>
                <h2 className="font-heading text-xl font-bold">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Преглед на дневника · {classLabel(selected) ?? 'Без клас'} клас
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning" className="flex items-center gap-1.5">
                <CircleAlert className="size-3.5" /> {unexcused} неизв.
              </Badge>
              <Badge tone="primary" className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5" /> {grades.length} оценки
              </Badge>
              <Badge tone="accent" className="flex items-center gap-1.5">
                <MessageSquareText className="size-3.5" /> {remarks.length} бележки
              </Badge>
            </div>
          </div>

          {loading ? (
            <Card>
              <CardBody className="py-10 text-center text-sm text-muted-foreground">Зареждане...</CardBody>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Оценки
                  </h3>
                  {gradesBySubject.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Няма въведени оценки.</p>
                  ) : (
                    gradesBySubject.map((row) => (
                      <div
                        key={row.subject.subjectId}
                        className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                      >
                        <p className="font-medium text-sm">{row.subject.subjectName}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {row.grades.map((g) => (
                            <GradePill key={g.gradeId} value={g.gradeValue} className="size-7 text-xs" />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody className="space-y-3">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Отсъствия
                  </h3>
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                    <span className="text-sm text-muted-foreground">Извинени</span>
                    <span className="font-semibold">{excused}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                    <span className="text-sm text-muted-foreground">Неизвинени</span>
                    <span className="font-semibold">{unexcused}</span>
                  </div>
                </CardBody>
              </Card>

              <Card className="lg:col-span-2">
                <CardBody className="space-y-2">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Бележки
                  </h3>
                  {orderedRemarks.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Няма записани бележки.</p>
                  ) : (
                    orderedRemarks.map((r) => (
                      <div key={r.remarkId} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-sm leading-relaxed text-foreground">{r.text}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {r.teacherFirstName} {r.teacherLastName} · {r.dateCreated}
                        </p>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
