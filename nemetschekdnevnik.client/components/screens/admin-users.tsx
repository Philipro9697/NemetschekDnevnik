'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { userService } from '@/api/userService'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { classes, classById, type Role, type User } from '@/lib/data'
import {
  UserPlus,
  Pencil,
  Ban,
  Trash2,
  Search,
  KeyRound,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  teacher: 'Учител',
  student: 'Ученик',
  parent: 'Родител',
}

const ROLE_TONE: Record<Role, 'primary' | 'accent' | 'success' | 'warning'> = {
  admin: 'warning',
  teacher: 'primary',
  student: 'accent',
  parent: 'success',
}

function transliterate(name: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht',
    ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
  }
  return name
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
}

export function AdminUsers() {
  const app = useApp()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [classFilter, setClassFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null)

  const filtered = useMemo(() => {
    const queryText = query.toLowerCase().trim()
    return app.users.filter((u) => {
      const className =
        classById(u.classId)?.name ?? (u.classTeacherOf ? classById(u.classTeacherOf)?.name + ' (кл.)' : '')
      const statusLabel = u.status === 'active' ? 'активен' : 'блокиран'
      const searchText = [u.name, u.email, className, statusLabel, ROLE_LABEL[u.role]]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesQuery = !queryText || searchText.includes(queryText)
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const matchesClass =
        classFilter === 'all' || u.classId === classFilter || u.classTeacherOf === classFilter
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesQuery && matchesRole && matchesClass && matchesStatus
    })
  }, [app.users, query, roleFilter, classFilter, statusFilter])

  const counts = {
    all: app.users.length,
    teacher: app.users.filter((u) => u.role === 'teacher').length,
    student: app.users.filter((u) => u.role === 'student').length,
    parent: app.users.filter((u) => u.role === 'parent').length,
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Администрация
            </div>
            <h2 className="font-heading text-xl font-bold">Управление на потребители</h2>
            <p className="mt-1 text-sm text-muted-foreground">Създавайте профили, следите активността и управлявайте ролите в училището.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-border bg-card/80 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Общо потребители</p>
              <p className="font-heading text-lg font-semibold">{counts.all}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Активни</p>
              <p className="font-heading text-lg font-semibold text-success">{app.users.filter((u) => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Търси по име, клас или статус..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-primary"
          >
            <option value="all">Всички класове</option>
            {classes.map((klass) => (
              <option key={klass.id} value={klass.id}>
                {klass.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
            className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-primary"
          >
            <option value="all">Всички статуси</option>
            <option value="active">Активни</option>
            <option value="blocked">Блокирани</option>
          </select>
          <Button onClick={() => setOpen(true)} className="shrink-0">
            <UserPlus className="size-4" /> Регистрирай нов потребител
          </Button>
        </div>
          </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', `Всички (${counts.all})`],
            ['teacher', `Учители (${counts.teacher})`],
            ['student', `Ученици (${counts.student})`],
            ['parent', `Родители (${counts.parent})`],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setRoleFilter(val as Role | 'all')}
            className={
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ' +
              (roleFilter === val
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40')
            }
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Име</th>
                <th className="px-4 py-3 font-semibold">Роля</th>
                <th className="px-4 py-3 font-semibold">Клас</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} className="size-9" />
                      <div className="min-w-0">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {classById(u.classId)?.name ??
                      (u.classTeacherOf ? classById(u.classTeacherOf)?.name + ' (кл.)' : '—')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center gap-1.5 text-sm font-medium ' +
                        (u.status === 'active' ? 'text-success' : 'text-danger')
                      }
                    >
                      <span
                        className={
                          'size-1.5 rounded-full ' +
                          (u.status === 'active' ? 'bg-success' : 'bg-danger')
                        }
                      />
                      {u.status === 'active' ? 'Активен' : 'Блокиран'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn label="Редакция">
                        <Pencil className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label={u.status === 'active' ? 'Блокирай' : 'Разблокирай'}
                        onClick={() =>
                          app.updateUserStatus(
                            u.id,
                            u.status === 'active' ? 'blocked' : 'active',
                          )
                        }
                        tone={u.status === 'active' ? 'warning' : 'success'}
                      >
                        {u.status === 'active' ? (
                          <Ban className="size-4" />
                        ) : (
                          <ShieldCheck className="size-4" />
                        )}
                      </IconBtn>
                      <IconBtn
                        label="Изтрий"
                        onClick={() => setDeleteCandidate(u)}
                        tone="danger"
                        disabled={u.role === 'admin'}
                      >
                        <Trash2 className="size-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Няма намерени потребители.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RegisterDialog open={open} onClose={() => setOpen(false)} />

      <Dialog open={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Потвърждение за изтриване</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Сигурни ли сте, че искате да изтриете потребителя{' '}
              <span className="font-semibold text-foreground">{deleteCandidate?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground">Изберете една от опциите по-долу.</p>
          </div>
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setDeleteCandidate(null)}>
              не не искам
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteCandidate) app.deleteUser(deleteCandidate.id)
                setDeleteCandidate(null)
              }}
            >
              да сигурен съм
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  tone = 'muted',
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  tone?: 'muted' | 'danger' | 'warning' | 'success'
  disabled?: boolean
}) {
  const toneMap = {
    muted: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    danger: 'text-muted-foreground hover:bg-danger/10 hover:text-danger',
    warning: 'text-muted-foreground hover:bg-warning/15 hover:text-warning-foreground',
    success: 'text-muted-foreground hover:bg-success/10 hover:text-success',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        'rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ' +
        toneMap[tone]
      }
    >
      {children}
    </button>
  )
}

function RegisterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const app = useApp()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<Role>('student')
    const [classId, setClassId] = useState<string>('c5a')

    // Track loading and error states for the API request
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Updated to include the generated password for the admin to copy
    const [created, setCreated] = useState<{ username: string; password?: string; accessCode?: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const username = name.trim() ? transliterate(name).replace(/\s+/g, '.') : ''

    function reset() {
        setName('')
        setEmail('')
        setRole('student')
        setClassId('c5a')
        setCreated(null)
        setCopied(false)
        setError(null)
        setLoading(false)
    }

    // 2. Make handleSubmit async to handle the server database entry
    async function handleSubmit() {
        if (!name.trim()) return

        setLoading(true)
        setError(null)

        // Split "Три имена" into FirstName and LastName for the backend DTO
        const nameParts = name.trim().split(/\s+/)
        const firstName = nameParts[0] || ''
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Петров'

        // Generate a safe temporary password since the UI form doesn't request one
        const generatedPassword = 'Nms' + Math.floor(100000 + Math.random() * 899000) + '!'

        // Map lowercase UI roles to capitalized backend system strings
        const backendRole = role.charAt(0).toUpperCase() + role.slice(1) // "Teacher" | "Student" | "Parent"

        const targetEmail = email.trim() || `${username}@ou-vazrazhdane.bg`

        try {
            // Send HTTP POST request to api/users
            const serverUser = await userService.createUser({
                email: targetEmail,
                password: generatedPassword,
                role: backendRole,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: '' // Can be gathered later or left blank
            })

            // Generate a mock child access code if it's a student assignment
            const accessCode =
                role === 'student'
                    ? `AC-${(classById(classId)?.name ?? 'X').replace('.', '')}-${Math.floor(1000 + Math.random() * 8999)}`
                    : undefined

            // Update local state context if your application syncs client arrays
            if (app.addUser) {
                app.addUser({
                    id: serverUser.userId,
                    name: `${serverUser.firstName} ${serverUser.lastName}`,
                    username: username,
                    email: serverUser.email,
                    role: role,
                    status: serverUser.isApproved ? 'active' : 'blocked',
                    ...(role === 'student' ? { classId, accessCode } : {}),
                })
            }

            // Display username and the generated password to the Administrator
            setCreated({ username, password: generatedPassword, accessCode })
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Възникна грешка при комуникацията със сървъра.')
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        reset()
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent className="max-w-lg">
                {created ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-success" />
                                Профилът е създаден успешно
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="rounded-xl border border-border bg-muted/40 p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Потребителско име за вход
                                </p>
                                <p className="font-mono text-lg font-semibold">{created.username}</p>
                            </div>

                            {/* Display generated password for admin distribution */}
                            <div className="rounded-xl border border-border bg-muted/40 p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Временна служебна парола
                                </p>
                                <p className="font-mono text-lg font-semibold text-danger">{created.password}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Предоставете тази парола на потребителя за първоначален достъп.</p>
                            </div>

                            {created.accessCode && (
                                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-primary">
                                        <KeyRound className="size-3.5" /> Код за достъп на родител
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <p className="font-mono text-lg font-semibold">{created.accessCode}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard?.writeText(created.accessCode!)
                                                setCopied(true)
                                            }}
                                            className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
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
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Предайте този код на родителя, за да свърже профила си с детето.
                                    </p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={reset}>
                                Създай още един
                            </Button>
                            <Button onClick={handleClose}>Готово</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-primary" />
                                Регистрация на нов потребител
                            </DialogTitle>
                        </DialogHeader>
                        <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <UsersRound className="size-4 text-primary" /> Бърз старт
                            </div>
                            <p className="mt-1">
                                Данните ще бъдат записани директно в централната база данни на училището.
                            </p>
                        </div>

                        {error && (
                            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                                {error}
                            </p>
                        )}

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Детайли за {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="w-full"
            tabs={[
              { value: 'grades', label: 'Оценки' },
              { value: 'notes', label: 'Бележки' },
              { value: 'absences', label: 'Отсъствия' },
            ]}
          />
          {tab === 'grades' && (
            <div className="space-y-10">
              <div className="rounded-xl border border-border bg-muted/10 p-10">
                <div className="grid gap-1 sm:grid-cols-1">
                  <div className="space-y-1.5">
                    <Label>Предмет</Label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Оценка</Label>
                    <select
                      value={gradeValue}
                      onChange={(e) => setGradeValue(Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {[2, 3, 4, 5, 6].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Тип</Label>
                    <select
                      value={gradeKind}
                      onChange={(e) => setGradeKind(e.target.value as 'oral' | 'written' | 'test' | 'active')}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="oral">Устна</option>
                      <option value="written">Писмена</option>
                      <option value="test">Тест</option>
                      <option value="active">Активност</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddGrade} className="w-full">
                      Добави оценка
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Предмет</th>
                      <th className="px-4 py-3">Оценка</th>
                      <th className="px-4 py-3">Тип</th>
                      <th className="px-4 py-3">Дата</th>
                      <th className="px-4 py-3 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {studentGrades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-4 py-3">{subjects.find((s) => s.id === grade.subjectId)?.name ?? '—'}</td>
                        <td className="px-4 py-3">{grade.value}</td>
                        <td className="px-4 py-3">{grade.kind}</td>
                        <td className="px-4 py-3">{grade.date}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" onClick={() => app.deleteGrade(grade.id)}>
                            Изтрий
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {studentGrades.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          Няма оценки.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Предмет</Label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Вид</Label>
                    <select
                      value={noteKind}
                      onChange={(e) => setNoteKind(e.target.value as 'praise' | 'remark')}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="remark">Бележка</option>
                      <option value="praise">Похвала</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddNote} className="w-full">
                      Добави бележка
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 mt-4">
                  <Label>Текст</Label>
                  <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Предмет</th>
                      <th className="px-4 py-3">Вид</th>
                      <th className="px-4 py-3">Текст</th>
                      <th className="px-4 py-3">Дата</th>
                      <th className="px-4 py-3 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {studentNotes.map((note) => (
                      <tr key={note.id}>
                        <td className="px-4 py-3">{subjects.find((s) => s.id === note.subjectId)?.name ?? '—'}</td>
                        <td className="px-4 py-3">{note.kind}</td>
                        <td className="px-4 py-3">{note.text}</td>
                        <td className="px-4 py-3">{note.date}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" onClick={() => app.deleteNote(note.id)}>
                            Изтрий
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {studentNotes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          Няма бележки.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'absences' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>Предмет</Label>
                    <select
                      value={absenceSubjectId}
                      onChange={(e) => setAbsenceSubjectId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата</Label>
                    <Input type="date" value={absenceDate} onChange={(e) => setAbsenceDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Час</Label>
                    <Input type="time" value={absenceTime} onChange={(e) => setAbsenceTime(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddAbsence} className="w-full">
                      Добави отсъствие
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-1 rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3">Предмет</th>
                      <th className="px-4 py-3">Дата</th>
                      <th className="px-4 py-3">Час</th>
                      <th className="px-4 py-3">Извинен</th>
                      <th className="px-4 py-3 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {studentAbsences.map((absence) => (
                      <tr key={absence.id}>
                        <td className="px-4 py-3">{subjects.find((s) => s.id === absence.subjectId)?.name ?? '—'}</td>
                        <td className="px-4 py-3">{absence.date}</td>
                        <td className="px-4 py-3">{absence.time ?? '—'}</td>
                        <td className="px-4 py-3">{absence.excused ? 'Да' : 'Не'}</td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                          <Button variant="outline" onClick={() => app.toggleAbsenceExcused(absence.id)}>
                            {absence.excused ? 'Отмени' : 'Извини'}
                          </Button>
                          <Button variant="outline" onClick={() => app.deleteAbsence(absence.id)}>
                            Изтрий
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {studentAbsences.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          Няма отсъствия.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={onClose}>Запази промени</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
