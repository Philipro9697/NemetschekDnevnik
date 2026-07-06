'use client'

import { useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { classById, type Role } from '@/lib/data'
import { UserCog, Bell, Palette, ShieldCheck, Check, Sparkles } from 'lucide-react'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  teacher: 'Учител',
  student: 'Ученик',
  parent: 'Родител',
}

export function SettingsScreen() {
  const { currentUser } = useApp()
  const [saved, setSaved] = useState(false)
  const [notifGrades, setNotifGrades] = useState(true)
  const [notifAbsences, setNotifAbsences] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  if (!currentUser) return null

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Настройки
            </div>
            <h2 className="font-heading text-xl font-bold">Персонализирай профила си</h2>
            <p className="mt-1 text-sm text-muted-foreground">Управлявай известията, сигурността и предпочитанията за работа.</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="size-4.5 text-primary" /> Профил
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} className="size-16 text-lg" />
            <div>
              <p className="font-heading text-lg font-bold">{currentUser.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone="primary">{ROLE_LABEL[currentUser.role]}</Badge>
                {currentUser.classId && (
                  <Badge tone="accent">{classById(currentUser.classId)?.name} клас</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Потребителско име</Label>
              <Input defaultValue={currentUser.username} readOnly className="bg-muted/40" />
            </div>
            <div className="space-y-1.5">
              <Label>Имейл</Label>
              <Input type="email" defaultValue={currentUser.email} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Потребителското име се задава от администратора и не може да бъде променяно.
          </p>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4.5 text-primary" /> Известия
          </CardTitle>
        </CardHeader>
        <CardBody className="divide-y divide-border">
          <ToggleRow
            label="Нови оценки"
            description="Известие при нанесена нова оценка"
            checked={notifGrades}
            onChange={setNotifGrades}
          />
          <ToggleRow
            label="Отсъствия и закъснения"
            description="Известие при отбелязано отсъствие"
            checked={notifAbsences}
            onChange={setNotifAbsences}
          />
          <ToggleRow
            label="Съобщения"
            description="Известие при ново съобщение в чата"
            checked={notifMessages}
            onChange={setNotifMessages}
          />
          <ToggleRow
            label="Седмичен имейл обзор"
            description="Обобщение на активността по имейл всеки петък"
            checked={emailDigest}
            onChange={setEmailDigest}
          />
        </CardBody>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4.5 text-primary" /> Изглед
          </CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-muted-foreground">
            Приложението използва светлата тема на училището (синьо-зелена гама). Допълнителни
            теми ще бъдат добавени в бъдеща версия.
          </p>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4.5 text-primary" /> Сигурност
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Нова парола</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label>Потвърди паролата</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="size-4" /> Промените са запазени
          </span>
        )}
        <Button onClick={handleSave}>Запази промените</Button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
          (checked ? 'bg-primary' : 'bg-muted-foreground/30')
        }
      >
        <span
          className={
            'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ' +
            (checked ? 'translate-x-5.5' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  )
}
