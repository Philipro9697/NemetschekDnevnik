'use client'

import { useState } from 'react'
import { Plus, Paperclip, FileCheck2, BookOpen, ClipboardList, Sparkles, Search } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import {
  subjects,
  classes,
  subjectById,
  classById,
  userById,
  formatDate,
  type Homework,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export function TeacherHomework() {
  const { currentUser, homework, addHomework, addFeedback, users } = useApp()
  const [tab, setTab] = useState<'homework' | 'material'>('homework')
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')

  const mySubjectIds = currentUser?.subjectIds ?? []
  const myHomework = homework.filter(
    (h) => h.teacherId === currentUser?.id && h.type === tab,
  )
  const filteredHomework = myHomework.filter((h) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
  })

  // Teacher's own classes (from schedule of subjects they teach)
  const myClasses = classes // simplified: teacher can pick from all their paralell classes

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Управление на задачи
            </div>
            <h2 className="font-heading text-xl font-bold">Учителски задачи и материали</h2>
            <p className="mt-1 text-sm text-muted-foreground">Следете подадените работи и качените материали по класове и предмети.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Добави нова задача
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'homework' | 'material')}
          tabs={[
            { value: 'homework', label: 'Домашни работи', icon: <ClipboardList /> },
            { value: 'material', label: 'Учебни материали', icon: <BookOpen /> },
          ]}
        />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Търси задача" className="h-10 pl-9" />
        </div>
      </div>

      {filteredHomework.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Все още няма добавени {tab === 'homework' ? 'домашни работи' : 'материали'}.
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHomework.map((h) => (
            <HomeworkCard key={h.id} hw={h} onFeedback={addFeedback} users={users} />
          ))}
        </div>
      )}

      {creating && (
        <CreateTaskDialog
          type={tab}
          subjectIds={mySubjectIds}
          classes={myClasses}
          onClose={() => setCreating(false)}
          onCreate={(data) => {
            addHomework({ ...data, teacherId: currentUser!.id, type: tab })
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}

function HomeworkCard({
  hw,
  onFeedback,
  users,
}: {
  hw: Homework
  onFeedback: (id: string, studentId: string, fb: string) => void
  users: ReturnType<typeof userById>[] | any
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">{subjectById(hw.subjectId).abbr}</Badge>
          {hw.classIds.map((c) => (
            <Badge key={c} variant="neutral">
              {classById(c)?.name}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            Краен срок: {formatDate(hw.dueDate)}
          </span>
        </div>
        <CardTitle className="mt-1">{hw.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{hw.description}</p>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Предадени работи ({hw.submissions.length})
          </p>
          {hw.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма предадени работи.</p>
          ) : (
            <div className="space-y-2">
              {hw.submissions.map((sub) => (
                <SubmissionRow key={sub.studentId} hwId={hw.id} sub={sub} onFeedback={onFeedback} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionRow({
  hwId,
  sub,
  onFeedback,
}: {
  hwId: string
  sub: { studentId: string; fileName: string; feedback?: string }
  onFeedback: (id: string, studentId: string, fb: string) => void
}) {
  const student = userById(sub.studentId)
  const [fb, setFb] = useState(sub.feedback ?? '')
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <Avatar name={student?.name ?? ''} className="size-8 text-[0.65rem]" />
        <span className="text-sm font-medium">{student?.name}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
          <FileCheck2 className="size-3.5" /> {sub.fileName}
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={fb}
          onChange={(e) => setFb(e.target.value)}
          placeholder="Обратна връзка / коментар от учителя..."
          className="h-9"
        />
        <Button size="sm" className="h-9" onClick={() => onFeedback(hwId, sub.studentId, fb)}>
          Запиши
        </Button>
      </div>
      {sub.feedback && (
        <p className="mt-1.5 text-xs text-success">Обратна връзка е изпратена.</p>
      )}
    </div>
  )
}

function CreateTaskDialog({
  type,
  subjectIds,
  classes: classList,
  onClose,
  onCreate,
}: {
  type: 'homework' | 'material'
  subjectIds: string[]
  classes: typeof classes
  onClose: () => void
  onCreate: (data: {
    title: string
    description: string
    subjectId: string
    classIds: string[]
    dueDate: string
  }) => void
}) {
  const availableSubjects = subjects.filter((s) => subjectIds.includes(s.id))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState(availableSubjects[0]?.id ?? '')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [file, setFile] = useState<string | null>(null)

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={type === 'homework' ? 'Нова домашна работа' : 'Нов учебен материал'}
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Предмет</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Краен срок</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Заглавие</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр. Обикновени дроби — упражнение" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Описание</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опиши задачата подробно..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Избери класове, които да виждат задачата
          </label>
          <div className="flex flex-wrap gap-2">
            {classList.map((c) => {
              const on = selectedClasses.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={cn(
                    'rounded-lg border-2 px-3.5 py-1.5 text-sm font-medium transition-colors',
                    on
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Показани са само вашите паралелки за по-бърз избор.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFile('material.pdf')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Paperclip className="size-4" />
          {file ? `Прикачен: ${file}` : 'Прикачи файл (PDF или снимка)'}
        </button>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Отказ
          </Button>
          <Button
            disabled={!title.trim() || selectedClasses.length === 0}
            onClick={() =>
              onCreate({
                title: title.trim(),
                description: description.trim(),
                subjectId,
                classIds: selectedClasses,
                dueDate: dueDate || new Date().toISOString().slice(0, 10),
              })
            }
          >
            Създай задача
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
