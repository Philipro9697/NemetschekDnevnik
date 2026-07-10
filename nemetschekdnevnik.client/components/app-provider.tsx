'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/api/authService'
import {
  users as seedUsers,
  seedGrades,
  seedAbsences,
  seedNotes,
  seedHomework,
  seedEvents,
  seedThreads,
  type User,
  type Role,
  type Grade,
  type Absence,
  type Note,
  type Homework,
  type CalendarEvent,
  type Thread,
} from '@/lib/data'

interface Notification {
  id: string
  text: string
  date: string
  read: boolean
  target: string // userId affected
}

interface AppState {
  currentUser: User | null
  users: User[]
  grades: Grade[]
  absences: Absence[]
  notes: Note[]
  homework: Homework[]
  events: CalendarEvent[]
  threads: Thread[]
  notifications: Notification[]
  view: string
  selectedClassId: string | null
  selectedChildId: string | null
  login: (userId: string, role?: string) => void
  logout: () => void
  setView: (v: string) => void
  setSelectedClass: (classId: string | null) => void
  setSelectedChildId: (id: string | null) => void
  addGrade: (g: Omit<Grade, 'id' | 'date'>) => void
  deleteGrade: (id: string) => void
  addAbsence: (a: Omit<Absence, 'id' | 'date'>) => void
  deleteAbsence: (id: string) => void
  toggleAbsenceExcused: (id: string) => void
  addNote: (n: Omit<Note, 'id' | 'date'>) => void
  deleteNote: (id: string) => void
  addUser: (u: Omit<User, 'id'>) => string
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void
  updateUserStatus: (id: string, status: 'active' | 'blocked') => void
  deleteUser: (id: string) => void
  addHomework: (h: Omit<Homework, 'id' | 'assignedDate' | 'submissions'>) => void
  submitHomework: (hwId: string, studentId: string, fileName: string) => void
  addFeedback: (hwId: string, studentId: string, feedback: string) => void
  gradeHomeworkSubmission: (hwId: string, studentId: string, grade: number | null, feedback: string) => void
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  sendMessage: (threadId: string, text: string) => void
  createThread: (name: string, participantIds: string[]) => string
  createGroupThread: (name: string, participantIds: string[]) => string
  markNotificationsRead: (target: string) => void
}

const AppContext = createContext<AppState | null>(null)

function nid() {
  return Math.random().toString(36).slice(2, 10)
}
function today() {
  return new Date().toISOString().slice(0, 10)
}
function nowTime() {
  return today() + ' ' + new Date().toTimeString().slice(0, 5)
}

function normalizeRole(role?: string): Role {
  const normalized = role?.trim().toLowerCase()
  if (normalized === 'admin' || normalized === 'teacher' || normalized === 'student' || normalized === 'parent') {
    return normalized
  }
  return 'student'
}

function getDefaultView(role: Role) {
  switch (role) {
    case 'admin':
      return 'users'
    case 'teacher':
      return 'diary'
    case 'student':
      return 'dashboard'
    case 'parent':
    default:
      return 'children'
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(seedUsers)
  const [grades, setGrades] = useState<Grade[]>(seedGrades)
  const [absences, setAbsences] = useState<Absence[]>(seedAbsences)
  const [notes, setNotes] = useState<Note[]>(seedNotes)
  const [homework, setHomework] = useState<Homework[]>(seedHomework)
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents)
  const [threads, setThreads] = useState<Thread[]>(seedThreads)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [view, setView] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  function notify(target: string, text: string) {
    setNotifications((prev) => [
      { id: nid(), text, date: nowTime(), read: false, target },
      ...prev,
    ])
  }

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      users,
      grades,
      absences,
      notes,
      homework,
      events,
      threads,
      notifications,
      view,
      selectedClassId,
      selectedChildId,
      login: (userId, role) => {
        const normalizedRole = normalizeRole(role)
        const existingUser =
          users.find((x) => x.id === userId) ??
          users.find((x) => x.username === userId || x.email === userId) ??
          null

        const nextUser = existingUser ?? ({
          id: userId,
          name: userId,
          username: userId,
          email: userId,
          role: normalizedRole,
          status: 'active' as const,
        } satisfies User)

        setCurrentUser(nextUser)
        setSelectedChildId(nextUser.role === 'parent' ? nextUser.childrenIds?.[0] ?? null : null)
        setView(getDefaultView(nextUser.role))
      },
      logout: () => {
        void authService.logout().catch(() => undefined)
        setCurrentUser(null)
        setView('')
        setSelectedClassId(null)
        setSelectedChildId(null)
      },
      setView,
      setSelectedClass: (classId) => setSelectedClassId(classId),
      setSelectedChildId: (id) => setSelectedChildId(id),
      addGrade: (g) => {
        setGrades((prev) => [{ ...g, id: nid(), date: today() }, ...prev])
        notify(g.studentId, `Нова оценка Отличен/${g.value} беше нанесена.`)
      },
      deleteGrade: (id) => setGrades((prev) => prev.filter((grade) => grade.id !== id)),
      addAbsence: (a) => {
        setAbsences((prev) => [{ ...a, id: nid(), date: today(), type: 'absent' }, ...prev])
        notify(a.studentId, 'Отбелязано е ново отсъствие.')
      },
      toggleAbsenceExcused: (id) =>
        setAbsences((prev) =>
          prev.map((a) => (a.id === id ? { ...a, excused: !a.excused } : a)),
        ),
      deleteAbsence: (id) => setAbsences((prev) => prev.filter((absence) => absence.id !== id)),
      addNote: (n) => {
        setNotes((prev) => [{ ...n, id: nid(), date: today() }, ...prev])
        notify(
          n.studentId,
          n.kind === 'praise' ? 'Получихте похвала от учител.' : 'Записана е нова забележка.',
        )
      },
      deleteNote: (id) => setNotes((prev) => prev.filter((note) => note.id !== id)),
      addUser: (u) => {
        const id = nid()
        setUsers((prev) => [...prev, { ...u, id }])
        return id
      },
      updateUser: (id, updates) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u))),
      updateUserStatus: (id, status) =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u))),
      deleteUser: (id) => setUsers((prev) => prev.filter((u) => u.id !== id)),
      addHomework: (h) =>
        setHomework((prev) => [
          { ...h, id: nid(), assignedDate: today(), submissions: [] },
          ...prev,
        ]),
      submitHomework: (hwId, studentId, fileName) =>
        setHomework((prev) =>
          prev.map((h) =>
            h.id === hwId
              ? {
                  ...h,
                  submissions: [
                    ...h.submissions.filter((s) => s.studentId !== studentId),
                    { studentId, fileName },
                  ],
                }
              : h,
          ),
        ),
      addFeedback: (hwId, studentId, feedback) =>
        setHomework((prev) =>
          prev.map((h) =>
            h.id === hwId
              ? {
                  ...h,
                  submissions: h.submissions.map((s) =>
                    s.studentId === studentId ? { ...s, feedback } : s,
                  ),
                }
              : h,
          ),
        ),
      gradeHomeworkSubmission: (hwId, studentId, grade, feedback) =>
        setHomework((prev) =>
          prev.map((h) =>
            h.id === hwId
              ? {
                  ...h,
                  submissions: h.submissions.map((s) =>
                    s.studentId === studentId ? { ...s, grade, feedback } : s,
                  ),
                }
              : h,
          ),
        ),
      addEvent: (e) => setEvents((prev) => [...prev, { ...e, id: nid() }]),
      sendMessage: (threadId, text) =>
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { id: nid(), senderId: currentUser?.id ?? '', text, time: nowTime() },
                  ],
                }
              : t,
          ),
        ),
      createThread: (name, participantIds) => {
        const id = nid()
        setThreads((prev) => [{ id, name, participantIds, messages: [] }, ...prev])
        return id
      },
      createGroupThread: (name, participantIds) => {
        const id = nid()
        setThreads((prev) => [{ id, name, participantIds, messages: [] }, ...prev])
        return id
      },
      markNotificationsRead: (target) =>
        setNotifications((prev) =>
          prev.map((n) => (n.target === target ? { ...n, read: true } : n)),
        ),
    }),
    [currentUser, users, grades, absences, notes, homework, events, threads, notifications, view, selectedClassId, selectedChildId],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
