'use client'

import { useMemo, useState } from 'react'
import { Plus, Paperclip, FileCheck2, BookOpen, ClipboardList, Sparkles, Search } from 'lucide-react'
import { useApp } from '@/components/app-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Avatar } from '@/components/ui/avatar'
import { subjects, classes, subjectById, classById, userById, formatDate, type Homework } from '@/lib/data'

export function TeacherHomework() {
  const { currentUser, homework, addHomework, addFeedback, users } = useApp()
  const [tab, setTab] = useState<'homework' | 'material'>('homework')
  const [creating, setCreating] = useState(false)
  const [query, setQuery] = useState('')

  const mySubjectIds = currentUser?.subjectIds ?? []
  const myHomework = useMemo(() => homework.filter((h) => h.teacherId === currentUser?.id && h.type === tab), [homework, currentUser?.id, tab])
  const filteredHomework = myHomework.filter((h) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return h.title.toLowerCase().includes(q) || h.description.toLowerCase().includes(q)
  })

  const myClasses = classes
  const canCreate = currentUser?.role === 'teacher' || currentUser?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Управление на задачи
            </div>
            <h2 className="font-heading text-xl font-bold">Домашни и учебни материали</h2>
            <p className="mt-1 text-sm text-muted-foreground">Учителите добавят задачи и материали за избран клас и предмет.</p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> {tab === 'homework' ? 'Добави домашна работа' : 'Добави учебен материал'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button type="button" onClick={() => setTab('homework')} className={`rounded-full px-3 py-2 text-sm ${tab === 'homework' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            <ClipboardList className="mr-1 inline size-4" /> Домашна работа
          </button>
          <button type="button" onClick={() => setTab('material')} className={`rounded-full px-3 py-2 text-sm ${tab === 'material' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            <BookOpen className="mr-1 inline size-4" /> Учебни материали
          </button>
        </div>
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

function HomeworkCard({ hw, onFeedback, users }: { hw: Homework; onFeedback: (id: string, studentId: string, fb: string) => void; users: ReturnType<typeof userById>[] | any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">{subjectById(hw.subjectId).abbr}</Badge>
          {hw.classIds.map((c) => (
            <Badge key={c} variant="neutral">{classById(c)?.name}</Badge>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">Краен срок: {formatDate(hw.dueDate)}</span>
        </div>
        <CardTitle className="mt-1">{hw.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{hw.description}</p>
        {hw.attachmentName && <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">Прикачен файл: {hw.attachmentName}</div>}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Предадени работи ({hw.submissions.length})</p>
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

function SubmissionRow({ hwId, sub, onFeedback }: { hwId: string; sub: { studentId: string; fileName: string; feedback?: string }; onFeedback: (id: string, studentId: string, fb: string) => void }) {
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
        <Input value={fb} onChange={(e) => setFb(e.target.value)} placeholder="Обратна връзка / коментар от учителя..." className="h-9" />
        <Button size="sm" className="h-9" onClick={() => onFeedback(hwId, sub.studentId, fb)}>Запиши</Button>
      </div>
      {sub.feedback && <p className="mt-1.5 text-xs text-success">Обратна връзка е изпратена.</p>}
    </div>
  )
}

function CreateTaskDialog({ type, subjectIds, classes: classList, onClose, onCreate }: { type: 'homework' | 'material'; subjectIds: string[]; classes: typeof classes; onClose: () => void; onCreate: (data: { title: string; description: string; subjectId: string; classIds: string[]; dueDate: string; attachmentName?: string }) => void }) {
  const availableSubjects = subjects.filter((s) => subjectIds.includes(s.id))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState(availableSubjects[0]?.id ?? '')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [attachmentName, setAttachmentName] = useState('')

  function toggleClass(id: string) {
    setSelectedClasses((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  return (
    <Dialog open onClose={onClose} title={type === 'homework' ? 'Добави домашна работа' : 'Добави учебен материал'} className="max-w-xl">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Предмет</label>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {availableSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{type === 'homework' ? 'Краен срок' : 'Прикачен файл'}</label>
            {type === 'homework' ? <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /> : <Input value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} placeholder="напр. урок_1.pdf" />}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Заглавие</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'homework' ? 'Напр. Обикновени дроби — упражнение' : 'Напр. Учебен материал по математика'} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Описание</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опиши задачата подробно..." />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">За кой клас</label>
          <div className="flex flex-wrap gap-2">
            {classList.map((klass) => (
              <button key={klass.id} type="button" onClick={() => toggleClass(klass.id)} className={`rounded-full border px-3 py-1.5 text-sm ${selectedClasses.includes(klass.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
                {klass.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Връщане назад</Button>
          <Button onClick={() => { onCreate({ title, description, subjectId, classIds: selectedClasses, dueDate, attachmentName: attachmentName || undefined }); }}>
            {type === 'homework' ? 'Добави домашно' : 'Добави материал'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
