'use client'

import { useEffect, useState } from 'react'
import { studentService } from '@/api/studentService'
import { parentService } from '@/api/parentService'
import type { AbsenceDto } from '@/api/types'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, subjects, type User } from '@/lib/data'
import { CircleAlert, Sparkles } from 'lucide-react'

type DisplayAbsence = {
  id: string
  studentId: string
  subjectId: string
  date: string
  time?: string
  excused: boolean
  subjectName: string
}

function toDisplayAbsenceFromDto(dto: AbsenceDto, studentId: string): DisplayAbsence {
  return {
    id: `${studentId}-${dto.lessonId}-${dto.date}`,
    studentId,
    subjectId: `${dto.subjectId}`,
    date: dto.date,
    time: dto.time?.length ? dto.time.slice(0, 5) : undefined,
    excused: typeof dto.isExcused !== 'undefined' ? dto.isExcused : (dto as any).excused,
    subjectName: dto.subjectName || 'Предмет',
  }
}

export function StudentAbsences({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? (app.currentUser?.role === 'student' ? app.currentUser : null)
  const [dbAbsences, setDbAbsences] = useState<DisplayAbsence[]>([])
  const [loadingAbsences, setLoadingAbsences] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!me) {
      setDbAbsences([])
      return
    }

    async function loadAbsences() {
      setLoadingAbsences(true)

      try {
        const targetStudentId = student && student.id ? student.id : app.currentUser!.id

        // Премахваме Promise.all и userService, за да избегнем 403 грешката
        const absenceData = student && student.id
          ? await parentService.getChildAbsences(Number(student.id))
          : await studentService.getAbsences()

        if (cancelled) return

        setDbAbsences((absenceData || []).map((absence) => toDisplayAbsenceFromDto(absence, targetStudentId)))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load absences', error)
          setDbAbsences([])
        }
      } finally {
        if (!cancelled) {
          setLoadingAbsences(false)
        }
      }
    }

    void loadAbsences()

    return () => {
      cancelled = true
    }
  }, [app.currentUser?.id, student?.id, me?.id])

  if (!me) return null

  // Взимаме името директно от обекта, предаден от рутера
  const displayName = me.name

  const myAbsences = dbAbsences.length > 0
    ? dbAbsences
    : (app.absences || [])
        .filter((a) => String(a.studentId) === String(me.id))
        .map((absence) => ({
          id: absence.id,
          studentId: absence.studentId,
          subjectId: absence.subjectId,
          date: absence.date,
          time: absence.time,
          excused: typeof absence.excused !== 'undefined' ? absence.excused : !!absence.excused,
          subjectName: subjects.find((subject) => subject.id === absence.subjectId)?.name ?? 'Предмет',
        }))

  const unexcused = myAbsences.filter((a) => !a.excused).length
  const excused = myAbsences.filter((a) => a.excused).length

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Отсъствия
            </div>
            <h2 className="font-heading text-2xl font-bold">Отсъствия на {displayName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {me.className ?? 'Без клас'} · наблюдение на отсъствия
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <CircleAlert className="size-4 text-danger" /> Статус
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-danger">{unexcused} неизв.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Обобщение</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
              <span className="text-sm text-muted-foreground">Общо отсъствия</span>
              <Badge tone="warning">{myAbsences.length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
              <span className="text-sm text-muted-foreground">Извинени</span>
              <Badge tone="success">{excused}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
              <span className="text-sm text-muted-foreground">Неизвинени</span>
              <Badge tone="danger">{unexcused}</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Детайли</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {loadingAbsences ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Зареждане на отсъствия…</p>
            ) : myAbsences.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Няма регистрирани отсъствия.</p>
            ) : (
              [...myAbsences]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((a) => (
                  <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">Отсъствие</p>
                      <p className="text-xs text-muted-foreground">
                        {a.subjectName} · {formatDate(a.date)} · {a.time ?? '—'}
                      </p>
                    </div>
                    <Badge tone={a.excused ? 'success' : 'danger'}>
                      {a.excused ? 'Извинено' : 'Неизвинено'}
                    </Badge>
                  </div>
                ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}