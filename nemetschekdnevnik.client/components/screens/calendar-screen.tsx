'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { classes, classById, type CalendarEvent } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarSync,
  CheckCircle2,
  Copy,
} from 'lucide-react'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември',
]

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export function CalendarScreen() {
  const app = useApp()
  const me = app.currentUser
  const [cursor, setCursor] = useState(() => new Date())
  const [addOpen, setAddOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const canManage = me?.role === 'admin' || me?.role === 'teacher'

  // Which class ids may this user see events for
  const myClassIds = useMemo(() => {
    if (!me) return []
    if (me.role === 'student' && me.classId) return [me.classId]
    if (me.role === 'parent') {
      return (me.childrenIds ?? [])
        .map((id) => app.users.find((u) => u.id === id)?.classId)
        .filter(Boolean) as string[]
    }
    return [] // admin/teacher: see all
  }, [me, app.users])

  const canSeeAll = me?.role === 'admin' || me?.role === 'teacher'

  function visibleFor(day: string): CalendarEvent[] {
    return app.events.filter((e) => {
      if (e.date !== day) return false
      if (canSeeAll) return true
      if (e.classIds.length === 0) return true // all classes
      return e.classIds.some((c) => myClassIds.includes(c))
    })
  }

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d))
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [year, month])

  const todayStr = ymd(new Date())

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Предишен месец"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label="Следващ месец"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        <h2 className="font-heading text-xl font-bold">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={() => setCursor(new Date())}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Днес
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setSyncOpen(true)}>
            <CalendarSync className="size-4" /> Синхронизирай с Google/Outlook
          </Button>
          {canManage && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Добави събитие
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-brand-blue" /> Контролни и класни
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-success" /> Събития и срещи
        </span>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const dayStr = date ? ymd(date) : ''
            const dayEvents = date ? visibleFor(dayStr) : []
            const isToday = dayStr === todayStr
            return (
              <div
                key={i}
                className={cn(
                  'min-h-24 border-b border-r border-border p-1.5 last:border-r-0 sm:min-h-28',
                  !date && 'bg-muted/20',
                )}
              >
                {date && (
                  <>
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setSelectedEvent(e)}
                          title={`${e.title}${e.description ? ' — ' + e.description : ''}`}
                          className={cn(
                            'w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight text-white transition-opacity hover:opacity-90',
                            e.type === 'exam' ? 'bg-brand-blue' : 'bg-success',
                          )}
                        >
                          {e.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {canManage && (
        <AddEventDialog open={addOpen} onClose={() => setAddOpen(false)} />
      )}
      <SyncDialog open={syncOpen} onClose={() => setSyncOpen(false)} />
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title ?? 'Събитие'}
        description={selectedEvent ? (selectedEvent.type === 'exam' ? 'Контролно / класно събитие' : 'Събитие / среща') : undefined}
      >
        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Дата</p>
              <p className="mt-1 font-medium">{selectedEvent.date}</p>
            </div>
            {selectedEvent.description && (
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Описание</p>
                <p className="mt-1 leading-relaxed text-foreground">{selectedEvent.description}</p>
              </div>
            )}
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Видимост</p>
              <p className="mt-1 font-medium">
                {selectedEvent.classIds.length === 0
                  ? 'За всички класове'
                  : `За ${selectedEvent.classIds.length} класа`}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

function AddEventDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(ymd(new Date()))
  const [type, setType] = useState<'exam' | 'event'>('exam')
  const [description, setDescription] = useState('')
  const [allClasses, setAllClasses] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  function reset() {
    setTitle('')
    setDate(ymd(new Date()))
    setType('exam')
    setDescription('')
    setAllClasses(true)
    setSelected([])
  }

  function toggleClass(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleSubmit() {
    if (!title.trim()) return
    app.addEvent({
      title: title.trim(),
      date,
      type,
      classIds: allClasses ? [] : selected,
      description: description.trim() || undefined,
    })
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Ново събитие в календара">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Заглавие</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="напр. Контролно по Математика"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Тип</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'exam' | 'event')}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="exam">Контролно / Класно</option>
              <option value="event">Събитие / Среща</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Описание (по избор)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="напр. Раздел „Дроби"
          />
        </div>

        <div className="space-y-2">
          <Label>Видимост на събитието</Label>
          <label className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={allClasses}
              onChange={(e) => setAllClasses(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="font-medium">Всички класове</span>
          </label>
          {!allClasses && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {classes.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                    selected.includes(c.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggleClass(c.id)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {allClasses
              ? 'Събитието ще е видимо за всички класове в училището.'
              : selected.length > 0
                ? `Видимо само за: ${selected.map((id) => classById(id)?.name).join(', ')}`
                : 'Изберете поне един клас.'}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || (!allClasses && selected.length === 0)}
          >
            Запази събитие
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function SyncDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = 'webcal://ou-vazrazhdane.bg/calendar/feed/personal.ics'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Синхронизация с външен календар"
      description="Добавете училищния календар към Google Calendar или Outlook."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            Защитен iCal линк
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-sm">{link}</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(link)
                setCopied(true)
              }}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3.5 text-success" /> Копирано
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Копирай
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Само събитията, отнасящи се до вашия клас, ще се появяват автоматично в личния ви
          календар на телефона.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Готово</Button>
        </div>
      </div>
    </Dialog>
  )
}
