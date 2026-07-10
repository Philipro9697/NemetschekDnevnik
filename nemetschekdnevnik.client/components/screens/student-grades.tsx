'use client'

import { useEffect, useState } from 'react'
import { studentService } from '@/api/studentService'
import type { GradeDto } from '@/api/types'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { GradePill } from '@/components/shared/grade-pill'
import { classById, formatDate, subjects, type Grade, type GradeSection, type User, userById } from '@/lib/data'
import { TrendingUp, Sparkles } from 'lucide-react'

const gradeSections: { key: GradeSection; label: string }[] = [
  { key: 'term1', label: '1ви срок' },
  { key: 'term1Final', label: 'Срочна 1ви' },
  { key: 'term2', label: '2ри срок' },
  { key: 'term2Final', label: 'Срочна 2ри' },
  { key: 'yearly', label: 'Годишна' },
]

type DisplayGrade = {
  id: string
  studentId: string
  subjectId: string
  teacherId: string
  value: number
  date: string
  time?: string
  kind?: 'oral' | 'written' | 'test' | 'active'
  section: GradeSection
  description?: string
  subjectName: string
  teacherName: string
}

function inferGradeSection(entryDate: string): GradeSection {
  const month = new Date(entryDate).getMonth() + 1
  return month <= 6 ? 'term1' : 'term2'
}

function toDisplayGrade(grade: Grade): DisplayGrade {
  return {
    id: grade.id,
    studentId: grade.studentId,
    subjectId: grade.subjectId,
    teacherId: grade.teacherId,
    value: grade.value,
    date: grade.date,
    time: grade.time,
    kind: grade.kind,
    section: grade.section,
    description: grade.description,
    subjectName: 'Предмет',
    teacherName: 'Учител',
  }
}

function toDisplayGradeFromDto(dto: GradeDto, studentId: string): DisplayGrade {
  const teacherName = [dto.teacherFirstName, dto.teacherLastName].filter(Boolean).join(' ').trim()

  return {
    id: `${studentId}-${dto.subjectId}-${dto.entryDate}`,
    studentId,
    subjectId: `${dto.subjectId}`,
    teacherId: `${dto.teacherId}`,
    value: Number(dto.gradeValue),
    date: dto.entryDate,
    section: inferGradeSection(dto.entryDate),
    description: dto.comment || dto.gradeTypeName,
    subjectName: dto.subjectName || 'Предмет',
    teacherName: teacherName || 'Учител',
  }
}

export function StudentGrades({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? (app.currentUser?.role === 'student' ? app.currentUser : null)
  const [selectedGrade, setSelectedGrade] = useState<DisplayGrade | null>(null)
  const [dbGrades, setDbGrades] = useState<DisplayGrade[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!app.currentUser || app.currentUser.role !== 'student' || Boolean(student)) {
      setDbGrades([])
      return () => {
        cancelled = true
      }
    }

    async function loadGrades() {
      setLoadingGrades(true)

      try {
        const data = await studentService.getGrades()
        if (cancelled) return

        setDbGrades(data.map((grade) => toDisplayGradeFromDto(grade, app.currentUser!.id)))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load grades', error)
          setDbGrades([])
        }
      } finally {
        if (!cancelled) {
          setLoadingGrades(false)
        }
      }
    }

    void loadGrades()

    return () => {
      cancelled = true
    }
  }, [app.currentUser?.id, app.currentUser?.role, student])

  if (!me) return null

  const myGrades = dbGrades.length > 0
    ? dbGrades
    : app.grades
        .filter((g) => g.studentId === me.id)
        .map((grade) => {
          const localGrade = toDisplayGrade(grade)
          const subjectName = subjects.find((subject) => subject.id === grade.subjectId)?.name ?? 'Предмет'
          const teacherName = userById(grade.teacherId, app.users)?.name ?? 'Учител'
          return {
            ...localGrade,
            subjectName,
            teacherName,
          }
        })

  const avg =
    myGrades.length > 0
      ? (myGrades.reduce((a, g) => a + g.value, 0) / myGrades.length).toFixed(2)
      : '—'

  const gradesBySubject = Array.from(
    myGrades.reduce((map, grade) => {
      const existing = map.get(grade.subjectName) ?? { subjectName: grade.subjectName, grades: [] as DisplayGrade[] }
      existing.grades.push(grade)
      map.set(grade.subjectName, existing)
      return map
    }, new Map<string, { subjectName: string; grades: DisplayGrade[] }>()).values(),
  )
    .map((row) => ({
      ...row,
      grades: row.grades.sort((a, b) => (a.date < b.date ? 1 : -1)),
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName))

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
          <p className="text-sm text-muted-foreground">Тази таблица показва оценките ти по предмети и срокове.</p>
        </CardHeader>
        <CardBody className="p-0">
          {loadingGrades ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Зареждане на оценки…</p>
          ) : gradesBySubject.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Все още няма оценки.</p>
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
                  {gradesBySubject.map(({ subjectName, grades }) => (
                    <tr key={subjectName} className="border-t border-border/70">
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-foreground">{subjectName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {grades.length} оценк{grades.length === 1 ? 'а' : 'и'}
                        </div>
                      </td>
                      {gradeSections.map((section) => {
                        const sectionGrades = grades.filter((g) => g.section === section.key)
                        return (
                          <td key={section.key} className="border-l border-border/70 px-4 py-3 align-top">
                            {sectionGrades.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {sectionGrades.map((g) => (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => setSelectedGrade(g)}
                                    className="rounded-md border border-border/70 bg-background/80 p-0.5"
                                  >
                                    <GradePill
                                      value={g.value}
                                      title={`${subjectName} · ${formatDate(g.date)}`}
                                      className="size-5 text-[0.65rem]"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
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

      <Dialog open={Boolean(selectedGrade)} onClose={() => setSelectedGrade(null)} title="Детайли за оценка">
        {selectedGrade && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="font-semibold">{selectedGrade.subjectName}</div>
              <GradePill value={selectedGrade.value} className="size-8 text-sm" />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Дата и час</div>
              <div>{selectedGrade.date} · {selectedGrade.time ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Учител</div>
              <div>{selectedGrade.teacherName}</div>
            </div>
            {selectedGrade.description && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground">{selectedGrade.description}</div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
