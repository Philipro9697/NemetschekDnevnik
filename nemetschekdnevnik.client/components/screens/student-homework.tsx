'use client'

import { useMemo, useState } from 'react'
import type { User } from '@/lib/data'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subjectById, userById, formatDate } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Paperclip,
  CheckCircle2,
  Upload,
  FileText,
  BookMarked,
  Search,
  Filter,
} from 'lucide-react'

export function StudentHomework({ student }: { student?: User }) {
  const app = useApp()
  const me = student ?? (app.currentUser?.role === 'student' ? app.currentUser : null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (!me) return null

  const myClass = me.classId
  const items = app.homework
    .filter((h) => h.classIds.includes(myClass ?? ''))
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))

  const homeworkItems = items.filter((h) => h.type === 'homework')
  const materialItems = items.filter((h) => h.type === 'material')

  const filteredHomework = useMemo(() => {
    const list = [...homeworkItems]
    const filtered = filterSubject === 'all' ? list : list.filter((item) => item.subjectId === filterSubject)
    return filtered.sort((a, b) => (sortBy === 'date' ? (a.dueDate < b.dueDate ? 1 : -1) : subjectById(a.subjectId).abbr.localeCompare(subjectById(b.subjectId).abbr)))
  }, [filterSubject, homeworkItems, sortBy])

  const filteredMaterial = useMemo(() => {
    const list = [...materialItems]
    return filterSubject === 'all' ? list : list.filter((item) => item.subjectId === filterSubject)
  }, [filterSubject, materialItems])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/80 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-transparent text-sm outline-none">
            <option value="all">Всички предмети</option>
            {Array.from(new Set(items.map((item) => item.subjectId))).map((subjectId) => (
              <option key={subjectId} value={subjectId}>{subjectById(subjectId).name}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === 'date' ? 'subject' : 'date')}>
          <Filter className="size-4" /> {sortBy === 'date' ? 'Сортирай по предмет' : 'Сортирай по дата'}
        </Button>
      </div>

      <Section title="Домашни работи" icon={FileText} empty="Няма зададени домашни.">
        {filteredHomework.map((h) => (
          <HomeworkCard key={h.id} id={h.id} studentId={me.id} selected={selectedId === h.id} onSelect={() => setSelectedId(selectedId === h.id ? null : h.id)} />
        ))}
      </Section>
      <Section title="Учебни материали" icon={BookMarked} empty="Няма качени материали.">
        {filteredMaterial.map((h) => (
          <HomeworkCard key={h.id} id={h.id} studentId={me.id} selected={selectedId === h.id} onSelect={() => setSelectedId(selectedId === h.id ? null : h.id)} />
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

function HomeworkCard({ id, studentId, selected, onSelect }: { id: string; studentId: string; selected: boolean; onSelect: () => void }) {
  const app = useApp()
  const hw = app.homework.find((h) => h.id === id)
  if (!hw) return null

  const subject = subjectById(hw.subjectId)
  const teacher = userById(hw.teacherId, app.users)
  const submission = hw.submissions.find((s) => s.studentId === studentId)
  const overdue = new Date(hw.dueDate) < new Date() && !submission && hw.type === 'homework'

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
          <p className="text-xs text-muted-foreground">преп. {teacher?.name}</p>
        </div>
        <ChevronDown className={cn('size-5 shrink-0 text-muted-foreground transition-transform', selected && 'rotate-180')} />
      </button>

      {selected && (
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Съдържание</p>
              <p className="whitespace-pre-line text-sm leading-relaxed">{hw.description}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-sm">
              <p className="font-medium">{subject.name}</p>
              <p className="mt-1 text-muted-foreground">Учител: {teacher?.name}</p>
              <p className="mt-1 text-muted-foreground">Дата на издаване: {formatDate(hw.assignedDate)}</p>
              <p className="mt-1 text-muted-foreground">Краен срок: {formatDate(hw.dueDate)}</p>
            </div>
          </div>
          {hw.type === 'homework' && <SubmitBox hwId={hw.id} studentId={studentId} submission={submission} />}
        </div>
      )}
    </Card>
  )
}

function SubmitBox({
  hwId,
  studentId,
  submission,
}: {
  hwId: string
  studentId: string
  submission?: { studentId: string; fileName: string; feedback?: string }
}) {
  const app = useApp()

  function handleUpload() {
    const names = ['domashno.jpg', 'resheniya.pdf', 'zadacha_snimka.png', 'tetradka.jpg']
    const fileName = names[Math.floor(Math.random() * names.length)]
    app.submitHomework(hwId, studentId, fileName)
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
