'use client'

import { useEffect, useState } from 'react'
import { studentService } from '@/api/studentService'
import { parentService } from '@/api/parentService' // Добавяме parentService
import type { RemarkDto } from '@/api/types'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, type User } from '@/lib/data'
import { MessageSquareText, Sparkles } from 'lucide-react'

type DisplayRemark = {
  id: string
  text: string
  date: string
  kind: 'praise' | 'remark'
  teacherName: string
}

function toDisplayRemark(dto: RemarkDto): DisplayRemark {
  const teacherName = [dto.teacherFirstName, dto.teacherLastName].filter(Boolean).join(' ').trim() || 'Учител'
  const kind = dto.type?.toLowerCase() === 'praise' ? 'praise' : 'remark'

  return {
    id: `${dto.remarkId}`,
    text: dto.text,
    date: dto.dateCreated,
    kind,
    teacherName,
  }
}

export function StudentNotes({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? (app.currentUser?.role === 'student' ? app.currentUser : null)
  const [dbRemarks, setDbRemarks] = useState<DisplayRemark[]>([])
  const [loadingRemarks, setLoadingRemarks] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!me) {
      setDbRemarks([])
      return
    }

    async function loadRemarks() {
      setLoadingRemarks(true)

      try {
        // Динамично определяме откъде да изтеглим бележките
        const data = student && student.id
          ? await parentService.getChildRemarks(Number(student.id)) // За родител
          : await studentService.getRemarks()                       // За ученик

        if (cancelled) return

        setDbRemarks((data || []).map(toDisplayRemark))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load remarks', error)
          setDbRemarks([])
        }
      } finally {
        if (!cancelled) {
          setLoadingRemarks(false)
        }
      }
    }

    void loadRemarks()

    return () => {
      cancelled = true
    }
  }, [student?.id, me?.id]) // Следим за промяна в ID-то на избраното дете или потребителя

  if (!me) return null

  const orderedNotes = [...dbRemarks]
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Бележки
            </div>
            <h2 className="font-heading text-2xl font-bold">Бележки и похвали на {me.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {me.className ?? 'Без клас'} · хронологичен преглед на бележките
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <MessageSquareText className="size-4 text-brand-blue" /> Бележки
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-brand-blue">{orderedNotes.length}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Хронология</CardTitle>
          <p className="text-sm text-muted-foreground">Всички бележки и похвали са видими в реално време.</p>
        </CardHeader>
        <CardBody className="space-y-3">
          {loadingRemarks ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Зареждане на бележки…</p>
          ) : orderedNotes.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Няма записани бележки.</p>
          ) : (
            orderedNotes.map((n) => (
              <div key={n.id} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed text-foreground">{n.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(n.date)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Учител: {n.teacherName}
                    </p>
                  </div>
                  <Badge tone={n.kind === 'praise' ? 'success' : 'danger'}>
                    {n.kind === 'praise' ? 'Похвала' : 'Забележка'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  )
}