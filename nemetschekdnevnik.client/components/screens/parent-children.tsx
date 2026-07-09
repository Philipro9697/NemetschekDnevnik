'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { StudentDashboard } from '@/components/screens/student-dashboard'
import { Card, CardBody } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { classById, userById } from '@/lib/data'
import { cn } from '@/lib/utils'
import { ChevronRight, TrendingUp, CircleAlert, BookOpenCheck } from 'lucide-react'

export function ParentChildren() {
  const app = useApp()
  const parent = app.currentUser
  const childrenIds = parent?.childrenIds ?? []
  const children = childrenIds
    .map((id) => userById(id, app.users))
    .filter(Boolean) as NonNullable<ReturnType<typeof userById>>[]

  const [selectedId, setSelectedId] = useState<string>(childrenIds[0] ?? '')
  const selected = children.find((c) => c.id === selectedId)

  const unexcusedFor = (id: string) =>
    app.absences.filter((a) => a.studentId === id && a.type === 'absent' && !a.excused).length

  const gradesFor = (id: string) => app.grades.filter((g) => g.studentId === id)
  const latestGrades = (id: string) => gradesFor(id).slice(0, 3)

  if (children.length === 0) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-muted-foreground">
          Няма свързани деца към този профил.
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Child selector */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => {
          const active = child.id === selectedId
          const unexcused = unexcusedFor(child.id)
          return (
            <button
              key={child.id}
              onClick={() => setSelectedId(child.id)}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                active
                  ? 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
              )}
            >
              <Avatar name={child.name} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{child.name}</p>
                <p className="text-xs text-muted-foreground">
                  {classById(child.classId)?.name} клас · № {child.number}
                </p>
              </div>
              {unexcused > 0 ? (
                <Badge tone="danger">{unexcused} неизв.</Badge>
              ) : (
                <ChevronRight
                  className={cn(
                    'size-5 text-muted-foreground transition-transform',
                    active && 'translate-x-0.5 text-primary',
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} className="size-9" />
              <div>
                <h2 className="font-heading text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Преглед на дневника · {classById(selected.classId)?.name} клас
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning" className="flex items-center gap-1.5">
                <CircleAlert className="size-3.5" /> {unexcusedFor(selected.id)} неизв.
              </Badge>
              <Badge tone="primary" className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5" /> {latestGrades(selected.id).length} последни оценки
              </Badge>
              <Badge tone="accent" className="flex items-center gap-1.5">
                <BookOpenCheck className="size-3.5" /> {app.homework.filter((h) => h.classIds.includes(selected.classId ?? '')).length} задачи
              </Badge>
            </div>
          </div>
          <StudentDashboard student={selected} hideHero />
        </div>
      )}
    </div>
  )
}
