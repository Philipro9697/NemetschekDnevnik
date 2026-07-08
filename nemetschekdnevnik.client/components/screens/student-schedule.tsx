'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { classById, schedule, subjectById, userById, type User } from '@/lib/data'
import { CalendarDays, Sparkles } from 'lucide-react'

const WEEK_DAYS = [
  { key: 'monday', label: 'Понеделник' },
  { key: 'tuesday', label: 'Вторник' },
  { key: 'wednesday', label: 'Сряда' },
  { key: 'thursday', label: 'Четвъртък' },
  { key: 'friday', label: 'Петък' },
]

export function StudentSchedule({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? app.currentUser
  const [selectedDay, setSelectedDay] = useState('monday')
  if (!me) return null

  const daySchedule = useMemo(() => {
    const byDay: Record<string, typeof schedule> = {
      monday: schedule.slice(0, 3),
      tuesday: schedule.slice(3, 5),
      wednesday: schedule.slice(0, 2),
      thursday: schedule.slice(2, 4),
      friday: schedule.slice(1, 5),
    }
    return byDay[selectedDay] ?? schedule
  }, [selectedDay])

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Програма за седмицата
            </div>
            <h2 className="font-heading text-2xl font-bold">Седмична програма</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {classById(me.classId)?.name ?? 'Без клас'} · изберете ден за подробен преглед
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <CalendarDays className="size-4 text-success" /> {WEEK_DAYS.find((d) => d.key === selectedDay)?.label}
            </p>
            <p className="mt-1 font-heading text-xl font-semibold text-success">{daySchedule.length} часа</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {WEEK_DAYS.map((day) => (
          <Button key={day.key} variant={selectedDay === day.key ? 'default' : 'outline'} size="sm" onClick={() => setSelectedDay(day.key)}>
            {day.label}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Часове за {WEEK_DAYS.find((d) => d.key === selectedDay)?.label}</CardTitle>
          <p className="text-sm text-muted-foreground">Табличен преглед с предмети, учители и кабинет.</p>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Час</th>
                <th className="px-4 py-3">Предмет</th>
                <th className="px-4 py-3">Учител</th>
                <th className="px-4 py-3">Кабинет</th>
                <th className="px-4 py-3">Време</th>
              </tr>
            </thead>
            <tbody>
              {daySchedule.map((lesson) => (
                <tr key={`${selectedDay}-${lesson.period}`} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{lesson.period}. час</td>
                  <td className="px-4 py-3">{subjectById(lesson.subjectId).name}</td>
                  <td className="px-4 py-3">{userById(lesson.teacherId, app.users)?.name}</td>
                  <td className="px-4 py-3">{lesson.room}</td>
                  <td className="px-4 py-3">{lesson.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
