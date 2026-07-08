'use client'

import { useMemo, useState } from 'react'
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

  const filtered = useMemo(() => {
    return app.users.filter((u) => {
      const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase().trim())
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [app.users, query, roleFilter])

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
            placeholder="Търси потребител по име..."
            className="pl-10"
          />
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <UserPlus className="size-4" /> Регистрирай нов потребител
        </Button>
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
                        label={u.status === 'active' ? 'Блокирай' : 'Активирай'}
                        onClick={() =>
                          app.updateUserStatus(
                            u.id,
                            u.status === 'active' ? 'blocked' : 'active',
                          )
                        }
                        tone={u.status === 'active' ? 'warning' : 'success'}
                      >
                        <Ban className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label="Изтрий"
                        onClick={() => app.deleteUser(u.id)}
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
  const [created, setCreated] = useState<{ username: string; accessCode?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const username = name.trim() ? transliterate(name).replace(/\s+/g, '.') : ''

  function reset() {
    setName('')
    setEmail('')
    setRole('student')
    setClassId('c5a')
    setCreated(null)
    setCopied(false)
  }

  function handleSubmit() {
    if (!name.trim()) return
    const accessCode =
      role === 'student'
        ? `AC-${(classById(classId)?.name ?? 'X').replace('.', '')}-${Math.floor(1000 + Math.random() * 8999)}`
        : undefined
    const newUser: Omit<User, 'id'> = {
      name: name.trim(),
      username,
      email: email.trim() || `${username}@ou-vazrazhdane.bg`,
      role,
      status: 'active',
      ...(role === 'student' ? { classId, accessCode } : {}),
    }
    app.addUser(newUser)
    setCreated({ username, accessCode })
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
                За учениците автоматично се генерира достъпен код за родител, а за учителите и
                родителите се създава профил без допълнителни класови настройки.
              </p>
            </div>
            <div className="space-y-4 py-2">
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
                  <Label>Роля</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="teacher">Учител</option>
                    <option value="student">Ученик</option>
                    <option value="parent">Родител</option>
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
              </div>
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
                <Label>Автоматично потребителско име</Label>
                <div className="flex h-10 items-center rounded-lg border border-dashed border-border bg-muted/40 px-3 font-mono text-sm text-muted-foreground">
                  {username || '—'}
                </div>
              </div>
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
