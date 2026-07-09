'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  CalendarDays,
  MessagesSquare,
  BookOpenCheck,
  ClipboardList,
  GraduationCap,
  UsersRound,
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Settings,
  TrendingUp,
  CircleAlert,
  MessageSquareText,
  CalendarRange,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Avatar } from '@/components/ui/avatar'
import { useApp } from '@/components/app-provider'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/data'

interface NavItem {
  view: string
  label: string
  icon: React.ElementType
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { view: 'users', label: 'Потребители', icon: Users },
    { view: 'reports', label: 'Справки и архив', icon: FileBarChart },
    { view: 'calendar', label: 'Календар', icon: CalendarDays },
    { view: 'messages', label: 'Съобщения', icon: MessagesSquare },
    { view: 'settings', label: 'Настройки', icon: Settings },
  ],
  teacher: [
    { view: 'diary', label: 'Програма', icon: BookOpenCheck },
    { view: 'grades', label: 'Дневник', icon: TrendingUp },
    { view: 'classteacher', label: 'Класен ръководител', icon: UsersRound },
    { view: 'homework', label: 'Домашни и материали', icon: ClipboardList },
    { view: 'calendar', label: 'Календар', icon: CalendarDays },
    { view: 'messages', label: 'Съобщения', icon: MessagesSquare },
  ],
  student: [
    { view: 'dashboard', label: 'Моето табло', icon: LayoutDashboard },
    { view: 'grades', label: 'Оценки', icon: TrendingUp },
    { view: 'absences', label: 'Отсъствия', icon: CircleAlert },
    { view: 'notes', label: 'Бележки', icon: MessageSquareText },
    { view: 'schedule', label: 'Програма', icon: CalendarRange },
    { view: 'homework', label: 'Домашни и материали', icon: ClipboardList },
    { view: 'calendar', label: 'Календар', icon: CalendarDays },
    { view: 'messages', label: 'Съобщения', icon: MessagesSquare },
  ],
  parent: [
    { view: 'children', label: 'Моите деца', icon: GraduationCap },
    { view: 'grades', label: 'Оценки', icon: TrendingUp },
    { view: 'absences', label: 'Отсъствия', icon: CircleAlert },
    { view: 'notes', label: 'Бележки', icon: MessageSquareText },
    { view: 'schedule', label: 'Програма', icon: CalendarRange },
    { view: 'homework', label: 'Домашни и материали', icon: ClipboardList },
    { view: 'calendar', label: 'Календар', icon: CalendarDays },
    { view: 'messages', label: 'Съобщения', icon: MessagesSquare },
  ],
}

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  teacher: 'Учител',
  student: 'Ученик',
  parent: 'Родител',
}

function profileSvgDataUrl(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="#1f4f8b"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="36" font-family="Segoe UI, Arial" fill="white">${initials}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, view, setView, logout, notifications, markNotificationsRead } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  if (!currentUser) return null

  const items = NAV[currentUser.role]
  const showBell = currentUser.role === 'student' || currentUser.role === 'parent'
  const targets =
    currentUser.role === 'student'
      ? [currentUser.id]
      : currentUser.childrenIds ?? []
  const myNotifs = notifications.filter((n) => targets.includes(n.target))
  const unread = myNotifs.filter((n) => !n.read).length

  const NavContent = (
    <>
      <div className="px-5 py-6">
        <Logo variant="light" />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = view === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => {
                setView(item.view)
                setMobileOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={() => {
            setView('settings')
            setMobileOpen(false)
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
        >
          <Avatar name={currentUser.name} src={profileSvgDataUrl(currentUser.name)} className="size-9" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs text-sidebar-foreground/60">{ROLE_LABEL[currentUser.role]}</p>
          </div>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 flex-col bg-sidebar transition-all',
          sidebarOpen ? 'lg:flex' : 'hidden',
        )}
      >
        {NavContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              aria-label="Затвори менюто"
            >
              <X className="size-5" />
            </button>
            {NavContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className={cn('flex min-w-0 flex-1 flex-col transition-all', sidebarOpen ? 'lg:pl-64' : 'lg:pl-0')}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-card/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen((value) => !value)
              } else {
                setSidebarOpen((value) => !value)
              }
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            aria-label={sidebarOpen ? 'Скрий менюто' : 'Покажи менюто'}
          >
            {window.innerWidth >= 1024 ? (
              sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
          <div className="flex min-w-0 flex-col">
            <h1 className="font-heading text-lg font-bold tracking-tight">
              {items.find((i) => i.view === view)?.label ?? 'Табло'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABEL[currentUser.role]} · {currentUser.name}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {showBell && (
              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((o) => !o)
                    if (!bellOpen) targets.forEach((t) => markNotificationsRead(t))
                  }}
                  className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Известия"
                >
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex size-2.5 items-center justify-center">
                      <span className="absolute size-2.5 animate-ping rounded-full bg-danger/70" />
                      <span className="size-2 rounded-full bg-danger" />
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-border bg-card p-2 shadow-xl">
                    <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Известия
                    </p>
                    {myNotifs.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Няма нови известия.
                      </p>
                    ) : (
                      <ul className="max-h-80 space-y-0.5 overflow-y-auto">
                        {myNotifs.slice(0, 12).map((n) => (
                          <li
                            key={n.id}
                            className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
                          >
                            <p className="text-foreground">{n.text}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{n.date}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setView('settings')
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Avatar name={currentUser.name} src={profileSvgDataUrl(currentUser.name)} className="size-8" />
              <span className="hidden sm:inline">{currentUser.name}</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Изход</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  )
}
