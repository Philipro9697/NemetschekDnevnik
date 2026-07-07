'use client'

import { useState } from 'react'
import { Search, ChevronRight, Clock, DoorOpen, ArrowLeft } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ClassDiary } from '@/components/screens/class-diary'
import { StudentProfile } from '@/components/shared/student-profile'
import { teacherSchedule, subjectById, classById, classes, type Lesson } from '@/lib/data'
import { cn } from '@/lib/utils'

export function TeacherDiary() {
  const { currentUser, users, setView, setSelectedClass } = useApp()
  const [query, setQuery] = useState('')
  const [openLesson, setOpenLesson] = useState<Lesson | null>(null)

  const results =
    query.trim().length > 1
      ? [
          ...users.filter(
            (u) =>
              u.role === 'student' &&
              u.name.toLowerCase().includes(query.trim().toLowerCase()),
          ),
          ...classes.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
        ].slice(0, 8)
      : []

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Persistent search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Търси ученик (напиши име)..."
          className="h-14 rounded-2xl border-2 pl-12 text-base shadow-sm focus-visible:border-primary"
        />
      </div>

      {/* Search results override everything */}
      {query.trim().length > 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Намерени ученици: <span className="font-medium text-foreground">{results.length}</span>
          </p>
          {results.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Няма намерени ученици по „{query}".
            </Card>
          ) : results.length === 1 ? (
            <div>
              <button
                onClick={() => setQuery('')}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
              >
                <ArrowLeft className="size-4" /> Обратно към часовете
              </button>
              <StudentProfile student={results[0]} />
            </div>
          ) : (
            <div className="grid gap-2">
              {results.map((item) => {
                const isClass = 'id' in item && !('role' in item)
                const label = isClass ? item.name : item.name
                const badge = isClass ? 'Клас' : classById(item.classId)?.name
                return (
                  <button
                    key={isClass ? item.id : item.id}
                    onClick={() => {
                      if (isClass) {
                        setSelectedClass(item.id)
                        setView('grades')
                      } else {
                        setQuery(item.name)
                      }
                    }}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40"
                  >
                    <span className="font-medium">{label}</span>
                    <Badge variant="neutral">{badge}</Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : openLesson ? (
        <div>
          <button
            onClick={() => setOpenLesson(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-4" /> Обратно към часовете
          </button>
          <ClassDiary lesson={openLesson} />
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold">Днешна програма</h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('bg-BG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teacherSchedule.map((lesson, i) => {
              const subject = subjectById(lesson.subjectId)
              const klass = classById(lesson.classId)
              const accent = i % 2 === 0 ? 'primary' : 'brand-blue'
              return (
                <button
                  key={`${lesson.classId}-${lesson.period}`}
                  onClick={() => {
                    setSelectedClass(lesson.classId)
                    setView('grades')
                    setOpenLesson(lesson)
                  }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
                  )}
                >
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 w-1.5',
                      accent === 'primary' ? 'bg-primary' : 'bg-brand-blue',
                    )}
                  />
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant={accent === 'primary' ? 'green' : 'blue'}>
                      {lesson.period}. час · {lesson.time}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Отвори дневник <ChevronRight className="size-3.5" />
                    </span>
                  </div>
                  <p className="font-heading text-lg font-bold">
                    {klass?.name} клас
                  </p>
                  <p className="text-sm text-muted-foreground">{subject.name}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {lesson.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DoorOpen className="size-3.5" /> Стая {lesson.room}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
