'use client'
import { userService } from '@/api/userService'
import type { UserRole } from '@/api/types'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import { classes, classById, subjects, type Role, type User } from '@/lib/data'
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
  BookOpen,
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
  const [editCandidate, setEditCandidate] = useState<User | null>(null)
  const [detailCandidate, setDetailCandidate] = useState<User | null>(null)
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

      {/* Toolbar */}
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

      {/* Role filter chips */}
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

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Име</th>
                <th className="px-4 py-3 font-semibold">Роля</th>
                <th className="px-4 py-3 font-semibold">Клас / Предмет</th>
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
                    {u.role === 'student'
                      ? classById(u.classId)?.name ?? '—'
                      : u.role === 'teacher'
                      ? `${u.classTeacherOf ? classById(u.classTeacherOf)?.name + ' (кл.)' : '—'}${u.subjectIds?.length ? ` • ${u.subjectIds.map((id) => subjects.find((s) => s.id === id)?.name).filter(Boolean).join(', ')}` : ''}`
                      : '—'}
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
                      <IconBtn label="Редакция" onClick={() => setEditCandidate(u)}>
                        <Pencil className="size-4" />
                      </IconBtn>
                      {u.role === 'student' && (
                        <IconBtn label="Детайли" onClick={() => setDetailCandidate(u)}>
                          <BookOpen className="size-4" />
                        </IconBtn>
                      )}
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
      <EditUserDialog
        open={Boolean(editCandidate)}
        user={editCandidate}
        onClose={() => setEditCandidate(null)}
        onSave={(updates) => {
          if (editCandidate) {
            app.updateUser(editCandidate.id, updates)
          }
          setEditCandidate(null)
        }}
      />
      <StudentDetailDialog
        open={Boolean(detailCandidate)}
        student={detailCandidate}
        onClose={() => setDetailCandidate(null)}
      />

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
    const [phoneNumber, setPhoneNumber] = useState('')
    const [role, setRole] = useState<Role>('student')
    const [classId, setClassId] = useState<string>('c5a')
    const [teacherSubjectId, setTeacherSubjectId] = useState<string>(subjects[0]?.id ?? '')
    const [parentName, setParentName] = useState('')
    const [parentEmail, setParentEmail] = useState('')
    const [parentPhone, setParentPhone] = useState('')


    // Track loading and error states for the API request
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Updated to include the generated password for the admin to copy
    const [created, setCreated] = useState<{ username: string; password?: string; accessCode?: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const username = name.trim() ? transliterate(name).replace(/\s+/g, '.') : ''
    const parentUsername = parentName.trim() ? transliterate(parentName).replace(/\s+/g, '.') : ''

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

        const parentNameParts = parentName.trim().split(/\s+/)
        const parentFirstName = parentNameParts[0] || ''
        const parentLastName = parentNameParts.length > 1 ? parentNameParts.slice(1).join(' ') : 'Петрова'

        // Generate a safe temporary password since the UI form doesn't request one
        const generatedPassword = 'Nms' + Math.floor(100000 + Math.random() * 899000) + '!'
        const parentPassword = 'Nms' + Math.floor(100000 + Math.random() * 899000) + '!'

        // Map lowercase UI roles to capitalized backend system strings
        const backendRole: UserRole = role === 'teacher' ? 'Teacher' : role === 'student' ? 'Student' : 'Parent'

        const targetEmail = email.trim() || `${username}@ou-vazrazhdane.bg`

        try {
            // Send HTTP POST request to api/users
            const serverUser = await userService.createUser({
                email: targetEmail,
                password: generatedPassword,
                role: backendRole,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber.trim()
            })

            const secondaryUser = role === 'student' ? await userService.createUser({
                email: parentEmail.trim() || `${parentUsername}@ou-vazrazhdane.bg`,
                password: parentPassword,
                role: 'Parent',
                firstName: parentFirstName,
                lastName: parentLastName,
                phoneNumber: parentPhone.trim()
            }) : undefined

            // Generate a mock child access code if it's a student assignment
            const accessCode =
              role === 'student'
                ? `AC-${(classById(classId)?.name ?? 'X').replace('.', '')}-${Math.floor(1000 + Math.random() * 8999)}`
                : undefined  

            // Update local state context if your application syncs client arrays
            // 1. Add the main user (Student/Teacher)
            if (app.addUser) {
              app.addUser({
                name: `${serverUser.firstName} ${serverUser.lastName}`,
                username: username,
                email: serverUser.email,
                role: role,
                status: serverUser.isApproved ? 'active' : 'blocked',
                ...(role === 'student' ? { classId, accessCode } : {}),
              })
            }

            // 2. Add the secondary user (Parent) - Only if a student is being registered
            if (role === 'student' && app.addUser && secondaryUser) {
              const parentUsername = parentName.trim() ? transliterate(parentName).replace(/\s+/g, '.') : ''
            
              app.addUser({
                name: `${secondaryUser.firstName} ${secondaryUser.lastName}`,
                username: parentUsername, // Use a username derived from the parent's name
                email: secondaryUser.email,
                role: 'parent', // Hardcoded client-side role for parent
                status: secondaryUser.isApproved ? 'active' : 'blocked',
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
                Профилът е създаден
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Потребителско име
                </p>
                <p className="font-mono text-lg font-semibold">{created.username}</p>
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
              <DialogTitle className="flex items-center gap-10 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <ShieldCheck className="size-5 text-primary" />
                Регистрация на нов потребител
              </DialogTitle>
            </DialogHeader>
            <div>
              <div className="flex items-center gap-2 font-medium text-foreground">
              </div>
            </div>
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Роля</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="teacher">Учител</option>
                    <option value="student">Ученик</option>
                  </select>
                </div>
                {role === 'student' && (
                  <div className="space-y-1.5">
                    <Label>Клас</Label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {role === 'teacher' && (
                  <div className="space-y-1.5">
                    <Label>Предмет</Label>
                    <select
                      value={teacherSubjectId}
                      onChange={(e) => setTeacherSubjectId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Три имена</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="напр. Георги Иванов Петров"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Имейл</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="напр. g.petrov@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="напр. +359 87 123 4567"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Парола</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="изберете парола"
                />
              </div>
              {role === 'student' && (
                <>
                  <div className="space-y-1.5">
                    <Label>Три имена на родителя</Label>
                    <Input
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="напр. Мария Иванова Петрова"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Имейл на родителя</Label>
                      <Input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="имейл на родителя"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Телефон на родителя</Label>
                      <Input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="напр. +359 88 765 4321"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Парола на родителя</Label>
                    <Input
                      type="password"
                      value={parentPassword}
                      onChange={(e) => setParentPassword(e.target.value)}
                      placeholder="изберете парола на родителя"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Отказ
              </Button>
              <Button onClick={handleSubmit} disabled={!name.trim()}>
                Създай профил
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: {
  open: boolean
  user: User | null
  onClose: () => void
  onSave: (updates: Partial<Omit<User, 'id'>>) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [classId, setClassId] = useState<string>('c5a')
  const [classTeacherOf, setClassTeacherOf] = useState<string>('')
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? '')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setClassId(user.classId ?? 'c5a')
    setClassTeacherOf(user.classTeacherOf ?? '')
    setSubjectId(user.subjectIds?.[0] ?? subjects[0]?.id ?? '')
    setPhone(user.phone ?? '')
    setPassword(user.password ?? '')
  }, [user])

  function handleSave() {
    const updates: Partial<Omit<User, 'id'>> = {
      name: name.trim(),
      email: email.trim(),
      role,
      phone: phone.trim() || undefined,
      password: password.trim() || undefined,
    }

    if (role === 'student') {
      updates.classId = classId
      updates.classTeacherOf = undefined
      updates.subjectIds = undefined
    }

    if (role === 'teacher') {
      updates.classTeacherOf = classTeacherOf || undefined
      updates.subjectIds = subjectId ? [subjectId] : []
      updates.classId = undefined
    }

    if (role === 'parent' || role === 'admin') {
      updates.classId = undefined
      updates.classTeacherOf = undefined
      updates.subjectIds = undefined
    }

    onSave(updates)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редакция на акаунт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Роля</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="student">Ученик</option>
              <option value="teacher">Учител</option>
              <option value="parent">Родител</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Три имена</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Имейл</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Парола</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          {role === 'student' && (
            <div className="space-y-1.5">
              <Label>Клас</Label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {role === 'teacher' && (
            <>
              <div className="space-y-1.5">
                <Label>Преподава в клас</Label>
                <select
                  value={classTeacherOf}
                  onChange={(e) => setClassTeacherOf(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Няма клас</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
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
            </>
          )}
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={handleSave}>Запази промени</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StudentDetailDialog({
  open,
  student,
  onClose,
}: {
  open: boolean
  student: User | null
  onClose: () => void
}) {
  const app = useApp()
  const [tab, setTab] = useState<'grades' | 'notes' | 'absences'>('grades')
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? '')
  const [gradeValue, setGradeValue] = useState<number>(6)
  const [gradeKind, setGradeKind] = useState<'oral' | 'written' | 'test' | 'active'>('oral')
  const [noteText, setNoteText] = useState('')
  const [noteKind, setNoteKind] = useState<'praise' | 'remark'>('remark')
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().slice(0, 10))
  const [absenceTime, setAbsenceTime] = useState('08:00')
  const [absenceSubjectId, setAbsenceSubjectId] = useState<string>(subjects[0]?.id ?? '')

  useEffect(() => {
    if (!student) return
    setTab('grades')
    setSubjectId(subjects[0]?.id ?? '')
    setGradeValue(6)
    setGradeKind('oral')
    setNoteText('')
    setNoteKind('remark')
    setAbsenceDate(new Date().toISOString().slice(0, 10))
    setAbsenceTime('08:00')
    setAbsenceSubjectId(subjects[0]?.id ?? '')
  }, [student])

  if (!student) return null

  const studentGrades = app.grades.filter((grade) => grade.studentId === student.id)
  const studentNotes = app.notes.filter((note) => note.studentId === student.id)
  const studentAbsences = app.absences.filter((absence) => absence.studentId === student.id)
  const teachers = app.users.filter((u) => u.role === 'teacher')

  function handleAddGrade() {
    if (!student || !subjectId || !teachers[0]) return
    app.addGrade({
      studentId: student.id,
      subjectId,
      teacherId: teachers[0].id,
      value: gradeValue,
      kind: gradeKind,
      section: 'term1',
      description: '',
    })
  }

  function handleAddNote() {
    if (!student || !subjectId) return
    app.addNote({
      studentId: student.id,
      subjectId,
      teacherId: teachers[0]?.id ?? '',
      text: noteText,
      kind: noteKind,
      date: new Date().toISOString().slice(0, 10),
    })
    setNoteText('')
  }

  function handleAddAbsence() {
    if (!student || !absenceSubjectId) return
    app.addAbsence({
      studentId: student.id,
      subjectId: absenceSubjectId,
      teacherId: teachers[0]?.id,
      date: absenceDate,
      time: absenceTime,
      type: 'absent',
      excused: false,
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редакция на акаунт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Роля</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="student">Ученик</option>
              <option value="teacher">Учител</option>
              <option value="parent">Родител</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Три имена</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Имейл</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Парола</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          {role === 'student' && (
            <div className="space-y-1.5">
              <Label>Клас</Label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {role === 'teacher' && (
            <>
              <div className="space-y-1.5">
                <Label>Преподава в клас</Label>
                <select
                  value={classTeacherOf}
                  onChange={(e) => setClassTeacherOf(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Няма клас</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
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
            </>
          )}
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={handleSave}>Запази промени</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StudentDetailDialog({
  open,
  student,
  onClose,
}: {
  open: boolean
  student: User | null
  onClose: () => void
}) {
  const app = useApp()
  const [tab, setTab] = useState<'grades' | 'notes' | 'absences'>('grades')
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? '')
  const [gradeValue, setGradeValue] = useState<number>(6)
  const [gradeKind, setGradeKind] = useState<'oral' | 'written' | 'test' | 'active'>('oral')
  const [noteText, setNoteText] = useState('')
  const [noteKind, setNoteKind] = useState<'praise' | 'remark'>('remark')
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().slice(0, 10))
  const [absenceTime, setAbsenceTime] = useState('08:00')
  const [absenceSubjectId, setAbsenceSubjectId] = useState<string>(subjects[0]?.id ?? '')

  useEffect(() => {
    if (!student) return
    setTab('grades')
    setSubjectId(subjects[0]?.id ?? '')
    setGradeValue(6)
    setGradeKind('oral')
    setNoteText('')
    setNoteKind('remark')
    setAbsenceDate(new Date().toISOString().slice(0, 10))
    setAbsenceTime('08:00')
    setAbsenceSubjectId(subjects[0]?.id ?? '')
  }, [student])

  if (!student) return null

  const studentGrades = app.grades.filter((grade) => grade.studentId === student.id)
  const studentNotes = app.notes.filter((note) => note.studentId === student.id)
  const studentAbsences = app.absences.filter((absence) => absence.studentId === student.id)
  const teachers = app.users.filter((u) => u.role === 'teacher')

  function handleAddGrade() {
    if (!student || !subjectId || !teachers[0]) return
    app.addGrade({
      studentId: student.id,
      subjectId,
      teacherId: teachers[0].id,
      value: gradeValue,
      kind: gradeKind,
      section: 'term1',
      description: '',
    })
  }

  function handleAddNote() {
    if (!student || !subjectId) return
    app.addNote({
      studentId: student.id,
      subjectId,
      teacherId: teachers[0]?.id ?? '',
      text: noteText,
      kind: noteKind,
    })
    setNoteText('')
  }

  function handleAddAbsence() {
    if (!student || !absenceSubjectId) return
    app.addAbsence({
      studentId: student.id,
      subjectId: absenceSubjectId,
      teacherId: teachers[0]?.id,
      time: absenceTime,
      type: 'absent',
      excused: false,
    })
  } 

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Детайли за {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as 'grades' | 'notes' | 'absences')}
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
                <div className="grid gap-4 grid-cols-1">
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
                        <td className="px-4 py-3 text-right space-y-2">
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