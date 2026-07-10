'use client'

import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { teacherSchedule, subjectById, classById, type Lesson } from '@/lib/data'

function formatDayLabel(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function TeacherDiary() {
  const { users, setView, setSelectedClass } = useApp()
  const [query, setQuery] = useState('')
  const [dayOffset, setDayOffset] = useState(0)

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return []
    return users.filter((u) => u.role === 'student' && u.name.toLowerCase().includes(value)).slice(0, 6)
  }, [query, users])

  const lessons = teacherSchedule

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-[24px] border border-border bg-card/80 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold">Програма</h2>
            <p className="text-sm text-muted-foreground">Планираните часове за избран ден са под формата на таблица.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDayOffset((value) => value - 1)}>
              <ChevronLeft className="size-4" /> Предишен
            </Button>
            <Button size="sm" onClick={() => setDayOffset(0)}>
              <CalendarDays className="size-4" /> Днес
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDayOffset((value) => value + 1)}>
              Следващ <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Намерени ученици</p>
          <div className="grid gap-2">
            {results.map((student) => (
              <button key={student.id} type="button" onClick={() => { setSelectedClass(student.classId ?? null); setView('grades') }} className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-left text-sm">
                <span>{student.name}</span>
                <Badge variant="neutral">{student.number}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">{formatDayLabel(dayOffset)}</div>
            <div className="text-xs text-muted-foreground">Избран ден</div>
          </div>
          <Badge variant="blue">{lessons.length} часа</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Час</th>
                <th className="px-4 py-3">Време</th>
                <th className="px-4 py-3">Предмет</th>
                <th className="px-4 py-3">Клас</th>
                <th className="px-4 py-3">Стая</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => {
                const subject = subjectById(lesson.subjectId)
                const klass = classById(lesson.classId)
                return (
                  <tr key={`${lesson.classId}-${lesson.period}`} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium">{lesson.period}</td>
                    <td className="px-4 py-3">{lesson.time}</td>
                    <td className="px-4 py-3">{subject.name}</td>
                    <td className="px-4 py-3">{klass?.name}</td>
                    <td className="px-4 py-3">{lesson.room}</td>
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
