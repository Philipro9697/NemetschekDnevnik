'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@/lib/data'
import { useApp } from '@/components/app-provider'
import { studentService } from '@/api/studentService'
import { parentService } from '@/api/parentService'
import type { HomeworkItemDto } from '@/api/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { subjectById, userById, formatDate } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Paperclip,
  CheckCircle2,
  Upload,
  FileText,
  Search,
  Filter,
} from 'lucide-react'

function safeSubject(subjectId: string): { name: string; abbr: string } {
  return subjectById(subjectId) ?? { name: 'Предмет', abbr: '—' }
}

type DisplayHomework = {
  id: string
  subjectId: string
  teacherId: string
  teacherName: string
  title: string
  description: string
  resourceLink?: string
  assignedDate: string
  dueDate: string
}

function toDisplayHomeworkFromDto(dto: HomeworkItemDto, teacherName: string): DisplayHomework {
  return {
    id: `${dto.homeworkId}`,
    subjectId: `${dto.subjectId}`,
    teacherId: `${dto.teacherId}`,
    teacherName,
    title: dto.title,
    description: dto.description,
    resourceLink: dto.resourceLink || undefined,
    assignedDate: dto.dateAssigned,
    dueDate: dto.dateDue,
  }
}

type LocalSubmission = { fileName: string; feedback?: string }

export function StudentHomework({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? (app.currentUser?.role === 'student' ? app.currentUser : null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dbHomework, setDbHomework] = useState<DisplayHomework[]>([])
  const [loadingHomework, setLoadingHomework] = useState(false)
  const [localSubmissions, setLocalSubmissions] = useState<Record<string, LocalSubmission>>({})

  useEffect(() => {
    let cancelled = false

    if (!me) {
      setDbHomework([])
      return
    }

    async function loadHomework() {
      setLoadingHomework(true)

      try {
        // Динамичен избор на услуга според това дали сме родител или ученик
        const data = student && student.id
          ? await parentService.getChildHomework(Number(student.id))
          : await studentService.getHomework()

        if (cancelled) return

        setDbHomework(
          (data || []).map((dto) =>
            toDisplayHomeworkFromDto(dto, userById(`${dto.teacherId}`, app.users)?.name ?? 'Учител'),
          ),
        )
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load homework', error)
          setDbHomework([])
        }
      } finally {
        if (!cancelled) {
          setLoadingHomework(false)
        }
      }
    }

    void loadHomework()

    return () => {
      cancelled = true
    }
  }, [app.currentUser?.id, student?.id, me?.id, app.users])

  if (!me) return null

  const myClass = me.classId

  const localHomework: DisplayHomework[] = (app.homework || [])
    .filter((h) => h.classIds.includes(myClass ?? '') && h.type === 'homework')
    .map((h) => ({
      id: h.id,
      subjectId: h.subjectId,
      teacherId: h.teacherId,
      teacherName: userById(h.teacherId, app.users)?.name ?? 'Учител',
      title: h.title,
      description: h.description,
      assignedDate: h.assignedDate,
      dueDate: h.dueDate,
    }))

  const homeworkItems = dbHomework.length > 0 ? dbHomework : localHomework

  const filteredHomework = useMemo(() => {
    const list = [...homeworkItems]
    const filtered = filterSubject === 'all' ? list : list.filter((item) => item.subjectId === filterSubject)
    return filtered.sort((a, b) =>
      sortBy === 'date'
        ? (a.dueDate < b.dueDate ? 1 : -1)
        : safeSubject(a.subjectId).abbr.localeCompare(safeSubject(b.subjectId).abbr),
    )
  }, [filterSubject, homeworkItems, sortBy])

  function handleSubmit(hwId: string, fileName: string) {
    setLocalSubmissions((prev) => ({ ...prev, [hwId]: { fileName } }))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/80 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-transparent text-sm outline-none">
            <option value="all">Всички предмети</option>
            {Array.from(new Set(homeworkItems.map((item) => item.subjectId))).map((subjectId) => (
              <option key={subjectId} value={subjectId}>{safeSubject(subjectId).name}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === 'date' ? 'subject' : 'date')}>
          <Filter className="size-4" /> {sortBy === 'date' ? 'Сортирай по предмет' : 'Сортирай по дата'}
        </Button>
      </div>

      <Section title="Домашни работи" icon={FileText} empty={loadingHomework ? 'Зареждане на домашни…' : 'Няма зададени домашни.'}>
        {filteredHomework.map((hw) => (
          <HomeworkCard
            key={hw.id}
            hw={hw}
            selected={selectedId === hw.id}
            onSelect={() => setSelectedId(selectedId === hw.id ? null : hw.id)}
            submission={localSubmissions[hw.id]}
            onSubmit={(fileName) => handleSubmit(hw.id, fileName)}
          />
        ))}
      </Section>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  empty,
  children,
}: {
  title: string
  icon: React.ElementType
  empty: string
  children: React.ReactNode
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        <Icon className="size-5 text-primary" />
        {title}
      </h2>
      {hasChildren ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <Card className="p-6 text-center text-sm text-muted-foreground">{empty}</Card>
      )}
    </section>
  )
}

function HomeworkCard({
  hw,
  selected,
  onSelect,
  submission,
  onSubmit,
}: {
  hw: DisplayHomework
  selected: boolean
  onSelect: () => void
  submission?: LocalSubmission
  onSubmit: (fileName: string) => void
}) {
  const subject = safeSubject(hw.subjectId)
  const overdue = new Date(hw.dueDate) < new Date() && !submission

  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 py-2 text-primary">
          <span className="font-heading text-lg font-bold leading-none">{formatDate(hw.dueDate).split(' ')[0]}</span>
          <span className="text-xs uppercase">{formatDate(hw.dueDate).split(' ')[1]}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight">{subject.abbr}</span>
            {submission && <Badge tone="success"><CheckCircle2 className="size-3" /> Предадено</Badge>}
            {overdue && <Badge tone="danger">Просрочено</Badge>}
          </div>
          <p className="truncate text-sm font-medium">{hw.title}</p>
          <p className="text-xs text-muted-foreground">преп. {hw.teacherName}</p>
        </div>
        <ChevronDown className={cn('size-5 shrink-0 text-muted-foreground transition-transform', selected && 'rotate-180')} />
      </button>

      {selected && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Съдържание</p>
              <p className="whitespace-pre-line text-sm leading-relaxed">{hw.description}</p>
              {hw.resourceLink && (
                <a
                  href={hw.resourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
                >
                  <Paperclip className="size-3.5" /> Отвори прикачен материал
                </a>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-sm">
              <p className="font-medium">{subject.name}</p>
              <p className="mt-1 text-muted-foreground">Учител: {hw.teacherName}</p>
              <p className="mt-1 text-muted-foreground">Дата на издаване: {formatDate(hw.assignedDate)}</p>
              <p className="mt-1 text-muted-foreground">Краен срок: {formatDate(hw.dueDate)}</p>
            </div>
          </div>
          <SubmitBox submission={submission} onSubmit={onSubmit} />
        </div>
      )}
    </Card>
  )
}

function SubmitBox({
  submission,
  onSubmit,
}: {
  submission?: LocalSubmission
  onSubmit: (fileName: string) => void
}) {
  function handleUpload() {
    const names = ['domashno.jpg', 'resheniya.pdf', 'zadacha_snimka.png', 'tetradka.jpg']
    const fileName = names[Math.floor(Math.random() * names.length)]
    onSubmit(fileName)
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-4">
      {submission ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Paperclip className="size-4 text-primary" />
            <span className="font-medium">{submission.fileName}</span>
            <Badge tone="success" className="ml-auto">Предадено</Badge>
          </div>
          {submission.feedback && (
            <div className="rounded-lg bg-success/10 p-3 text-sm">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-success">Обратна връзка от учителя</p>
              <p>{submission.feedback}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleUpload}><Upload className="size-4" /> Прикачи нов файл</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-sm text-muted-foreground">Прикачи снимка или PDF с решението си.</p>
          <Button size="sm" onClick={handleUpload}><Upload className="size-4" /> Предай домашно</Button>
        </div>
      )}
    </div>
  )
}