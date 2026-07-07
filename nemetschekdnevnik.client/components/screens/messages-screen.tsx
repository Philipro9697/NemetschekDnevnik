'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/components/app-provider'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { userById, type User } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Send, MessagesSquare, ArrowLeft, Plus, Search, UsersRound } from 'lucide-react'

export function MessagesScreen() {
  const app = useApp()
  const me = app.currentUser
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string>('')
  const [draft, setDraft] = useState('')
  const [newContactId, setNewContactId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState('')

  const myThreads = useMemo(() => {
    if (!me) return []
    const mine = app.threads.filter((t) => t.participantIds.includes(me.id))
    return mine.length > 0 ? mine : app.threads
  }, [app.threads, me])

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return myThreads
    return myThreads.filter((thread) => thread.name.toLowerCase().includes(q))
  }, [myThreads, query])

  const active = filteredThreads.find((t) => t.id === activeId) ?? filteredThreads[0] ?? myThreads[0]

  if (!me) return null

  const contacts = app.users.filter((u) => u.id !== me.id)
  const canCreateGroup = me.role === 'admin' || me.role === 'teacher'

  function lastMessage(threadId: string) {
    const t = app.threads.find((x) => x.id === threadId)
    return t?.messages[t.messages.length - 1]
  }

  function handleSend() {
    const text = draft.trim()
    if (!text || !active) return
    app.sendMessage(active.id, text)
    setDraft('')
  }

  function handleCreateThread() {
    if (!newContactId) return
    const participantIds = [me.id, newContactId]
    const target = app.users.find((u) => u.id === newContactId)
    const id = app.createThread(target?.name ?? 'Нов контакт', participantIds)
    setActiveId(id)
    setNewContactId('')
    setShowCreate(false)
  }

  function handleCreateGroup() {
    if (!groupName.trim()) return
    const participantIds = [me.id, ...contacts.slice(0, 3).map((u) => u.id)]
    const id = app.createGroupThread(groupName.trim(), participantIds)
    setActiveId(id)
    setGroupName('')
    setShowCreate(false)
  }

  return (
    <Card className="flex h-[calc(100dvh-8rem)] overflow-hidden p-0">
      <aside className={cn('flex w-full flex-col border-r border-border sm:w-72 lg:w-80', active && 'hidden sm:flex')}>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">Чатове</h2>
            <button type="button" onClick={() => setShowCreate((value) => !value)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><Plus className="size-4" /></button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Търси чат" className="h-9 w-full rounded-full border border-input bg-background pl-9 pr-3 text-sm outline-none" />
          </div>
          {showCreate && (
            <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-sm">
              <select value={newContactId} onChange={(e) => setNewContactId(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-3">
                <option value="">Избери контакт</option>
                {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
              </select>
              <button type="button" onClick={handleCreateThread} className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Създай чат</button>
              {canCreateGroup && (
                <div className="space-y-2 border-t border-border pt-2">
                  <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Име на група" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                  <button type="button" onClick={handleCreateGroup} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"><UsersRound className="size-4" />Създай група</button>
                </div>
              )}
            </div>
          )}
        </div>
        <ul className="flex-1 overflow-y-auto">
          {filteredThreads.map((t) => {
            const last = lastMessage(t.id)
            const isActive = t.id === active?.id
            return (
              <li key={t.id}>
                <button onClick={() => setActiveId(t.id)} className={cn('flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors', isActive ? 'bg-primary/5' : 'hover:bg-muted/50')}>
                  <Avatar name={t.name} className="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{last ? last.text : 'Няма съобщения'}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className={cn('flex min-w-0 flex-1 flex-col', !active && 'hidden sm:flex')}>
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button onClick={() => setActiveId('')} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted sm:hidden" aria-label="Назад към чатовете"><ArrowLeft className="size-5" /></button>
              <Avatar name={active.name} className="size-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{active.name}</p>
                <p className="text-xs text-muted-foreground">{active.participantIds.length} участника</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {active.participantIds
                    .map((id) => userById(id, app.users)?.name)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(', ')}
                  {active.participantIds.length > 3 ? '…' : ''}
                </p>
              </div>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
              {active.messages.map((m) => {
                const mine = m.senderId === me.id
                const sender = userById(m.senderId, app.users)
                return (
                  <div key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                    {!mine && <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{sender?.name ?? 'Потребител'}</span>}
                    <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm', mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-card text-card-foreground border border-border')}>{m.text}</div>
                    <span className="mt-0.5 px-1 text-[11px] text-muted-foreground">{m.time.slice(-5)}</span>
                  </div>
                )
              })}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex items-center gap-2 border-t border-border p-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend() } }} placeholder="Напиши съобщение..." className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25" />
              <button type="submit" disabled={!draft.trim()} aria-label="Изпрати" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"><Send className="size-4.5" /></button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground"><MessagesSquare className="size-10" /><p className="text-sm">Избери чат, за да видиш съобщенията.</p></div>
        )}
      </section>
    </Card>
  )
}
