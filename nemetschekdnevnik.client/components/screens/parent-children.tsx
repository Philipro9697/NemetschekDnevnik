'use client'

import { useEffect, useState, useMemo } from 'react'
import { useApp } from '@/components/app-provider'
import { parentService } from '@/api/parentService'
import type { GradeDto, AbsenceDto, RemarkDto, SubjectDto } from '@/api/types'
import { Card, CardBody } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GradePill } from '@/components/shared/grade-pill'
import { cn } from '@/lib/utils'
import { ChevronRight, TrendingUp, CircleAlert, MessageSquareText } from 'lucide-react'

// Търсените секции за сроковете, съвпадащи с ученическия модел
type GradeSection = 'term1' | 'term1Final' | 'term2' | 'term2Final' | 'yearly'

const gradeSections: { key: GradeSection; label: string }[] = [
  { key: 'term1', label: '1ви срок' },
  { key: 'term1Final', label: 'Срочна 1ви' },
  { key: 'term2', label: '2ри срок' },
  { key: 'term2Final', label: 'Срочна 2ри' },
  { key: 'yearly', label: 'Годишна' },
]

const SECTION_TAG_RE = /^§(term1Final|term2Final|term1|term2|yearly)§/

function decodeComment(comment: string | null | undefined): { section: GradeSection; text: string } {
  if (comment) {
    const match = comment.match(SECTION_TAG_RE)
    if (match) {
      return { section: match[1] as GradeSection, text: comment.slice(match[0].length) }
    }
  }
  return { section: 'term1', text: comment ?? '' }
}

function classLabel(child: { classGrade: number; classLetter: string }) {
  return child.classGrade ? `${child.classGrade}${child.classLetter}` : null
}

export function ParentChildren() {
  const app = useApp()
  const children = app.apiChildren || []
  const { selectedChildId, setSelectedChildId } = useApp()

  const selected = useMemo(() => {
    if (!selectedChildId && children.length > 0) return children[0]
    return children.find((c) => String(c.studentId) === String(selectedChildId)) ?? children[0]
  }, [children, selectedChildId])

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
    if (!selected?.studentId) return

    setLoading(true)
    Promise.allSettled([
      parentService.getChildGrades(selected.studentId),
      parentService.getChildAbsences(selected.studentId),
      parentService.getChildRemarks(selected.studentId),
      parentService.getChildSubjects(selected.studentId),
    ])
      .then(([gradesResult, absencesResult, remarksResult, subjectsResult]) => {
        setGrades(gradesResult.status === 'fulfilled' ? (gradesResult.value || []) : [])
        setAbsences(absencesResult.status === 'fulfilled' ? (absencesResult.value || []) : [])
        setRemarks(remarksResult.status === 'fulfilled' ? (remarksResult.value || []) : [])
        setSubjects(subjectsResult.status === 'fulfilled' ? (subjectsResult.value || []) : [])
      })
      .catch((error) => console.error('Error fetching data:', error))
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

  // Подготвяме предметите и филтрираме само тези, по които има оценки
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
          const active = selected && String(child.studentId) === String(selected.studentId)
          const name = `${child.firstName} ${child.lastName}`
          return (
            <button
              key={child.studentId}
              type="button"
              onClick={() => setSelectedChildId(String(child.studentId))}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                active 
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30' 
                  : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
              )}
            >
              <Avatar name={name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className={cn('truncate font-semibold', active && 'text-primary')}>{name}</p>
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
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
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
            <div className="space-y-6">
              {/* НАПЪЛНО ОБНОВЕНА ТАБЛИЦА СЪС СРОКОВЕ (КАТО ПРИ УЧЕНИКА) */}
              <Card className="overflow-hidden border-primary/10">
                <div className="p-4 border-b border-border/70 bg-card">
                  <h3 className="font-heading text-base font-bold text-foreground">Оценки по предмети</h3>
                  <p className="text-xs text-muted-foreground">Разпределение на оценките на ученика по срокове и предмети.</p>
                </div>
                <CardBody className="p-0">
                  {gradesBySubject.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Няма въведени оценки.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="w-[240px] px-4 py-3">Предмет</th>
                            {gradeSections.map((section) => (
                              <th key={section.key} className="border-l border-border/70 px-4 py-3 text-center">
                                {section.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gradesBySubject.map(({ subject, grades }) => (
                            <tr key={subject.subjectId} className="border-t border-border/70">
                              <td className="px-4 py-3 align-top">
                                <div className="font-medium text-foreground">{subject.subjectName}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {grades.length} {grades.length === 1 ? 'оценка' : 'оценки'}
                                </div>
                              </td>
                              {gradeSections.map((section) => {
                                const sectionGrades = grades.filter(
                                  (g) => decodeComment(g.comment).section === section.key
                                )
                                return (
                                  <td key={section.key} className="border-l border-border/70 px-4 py-3 align-top text-center">
                                    {sectionGrades.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 justify-center">
                                        {sectionGrades.map((g) => (
                                          <GradePill key={g.gradeId} value={g.gradeValue} className="size-6 text-xs" />
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-muted-foreground block text-center">—</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Секции за Отсъствия и Бележки */}
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                  <div className="p-4 border-b border-border/70 bg-card">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">Отсъствия</h3>
                  </div>
                  <CardBody className="space-y-3 pt-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                      <span className="text-sm text-muted-foreground">Извинени</span>
                      <span className="font-semibold text-success">{excused}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                      <span className="text-sm text-muted-foreground">Неизвинени</span>
                      <span className="font-semibold text-danger">{unexcused}</span>
                    </div>
                  </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                  <div className="p-4 border-b border-border/70 bg-card">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">Бележки</h3>
                  </div>
                  <CardBody className="space-y-2 pt-4">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}