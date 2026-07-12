'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/api/authService'
import { userService } from '@/api/userService'
import { studentService } from '@/api/studentService'
import type { UserAccountDto, GradeDto, AbsenceDto, RemarkDto, ScheduleDto, SubjectDto } from '@/api/types'
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
  currentUser: (User & { apiData?: UserAccountDto }) | null
  users: User[]
  grades: Grade[]
  absences: Absence[]
  notes: Note[]
  // API data for students
  apiGrades: GradeDto[]
  apiAbsences: AbsenceDto[]
  apiRemarks: RemarkDto[]
  apiSchedule: ScheduleDto[]
  apiSubjects: SubjectDto[]
  homework: Homework[]
  events: CalendarEvent[]
  threads: Thread[]
  notifications: Notification[]
  view: string
  selectedClassId: string | null
  selectedChildId: string | null
  login: (userData: UserAccountDto) => Promise<void>
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
  sendGlobalAnnouncement: (text: string) => void
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
  const [currentUser, setCurrentUser] = useState<(User & { apiData?: UserAccountDto }) | null>(null)
  const [users, setUsers] = useState<User[]>(seedUsers)
  const [grades, setGrades] = useState<Grade[]>(seedGrades)
  const [absences, setAbsences] = useState<Absence[]>(seedAbsences)
  const [notes, setNotes] = useState<Note[]>(seedNotes)
  const [homework, setHomework] = useState<Homework[]>(seedHomework)
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents)
  const [threads, setThreads] = useState<Thread[]>(seedThreads)
  const [notifications, setNotifications] = useState<Notification[]>([])
  // API data for students
  const [apiGrades, setApiGrades] = useState<GradeDto[]>([])
  const [apiAbsences, setApiAbsences] = useState<AbsenceDto[]>([])
  const [apiRemarks, setApiRemarks] = useState<RemarkDto[]>([])
  const [apiSchedule, setApiSchedule] = useState<ScheduleDto[]>([])
  const [apiSubjects, setApiSubjects] = useState<SubjectDto[]>([])
  const [view, setView] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  function notify(target: string, text: string) {
    setNotifications((prev) => [
      { id: nid(), text, date: nowTime(), read: false, target },
      ...prev,
    ])
  }

  // Shared by both real login and the page-load session restore below, so the
  // "build a User from a UserAccountDto + fetch student data" logic lives in one place.
  async function applyUserProfile(userData: UserAccountDto) {
    const user: User & { apiData?: UserAccountDto } = {
      id: String(userData.userId),
      name: `${userData.firstName} ${userData.lastName}`,
      username: userData.email,
      email: userData.email,
      role: normalizeRole(userData.role),
      status: userData.isApproved ? 'active' : 'blocked',
      classId: '1',
      childrenIds: [],
      phone: userData.phoneNumber,
      apiData: userData,
    }
    setCurrentUser(user)
    setSelectedChildId(user.role === 'parent' ? user.childrenIds?.[0] ?? null : null)
    setView(getDefaultView(user.role))
    localStorage.setItem('userId', String(userData.userId))

    if (user.role === 'student') {
      try {
        const [gradesRes, absencesRes, remarksRes, scheduleRes, subjectsRes] = await Promise.all([
          studentService.getGrades(),
          studentService.getAbsences(),
          studentService.getRemarks(),
          studentService.getSchedule(),
          studentService.getSubjects(),
        ])
        setApiGrades(gradesRes)
        setApiAbsences(absencesRes)
        setApiRemarks(remarksRes)
        setApiSchedule(scheduleRes)
        setApiSubjects(subjectsRes)
      } catch (error) {
        console.error('Failed to fetch student data:', error)
      }
    }
  }

  // Restore a real session on page load/refresh, using the userId saved by login() below.
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedUserId = localStorage.getItem('userId')
    if (token && storedUserId && !currentUser) {
      userService.getUserProfile(Number(storedUserId))
        .then(applyUserProfile)
        .catch((error) => {
          console.error('Failed to sync user from API:', error)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('userId')
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      apiGrades,
      apiAbsences,
      apiRemarks,
      apiSchedule,
      apiSubjects,
      view,
      selectedClassId,
      selectedChildId,
      login: async (userData: UserAccountDto) => {
        await applyUserProfile(userData)
      },
      logout: () => {
        void authService.logout().catch(() => undefined)
        setCurrentUser(null)
        setView('')
        setSelectedClassId(null)
        setSelectedChildId(null)
        setGrades([])
        setAbsences([])
        setNotes([])
        setApiGrades([])
        setApiAbsences([])
        setApiRemarks([])
        setApiSchedule([])
        setApiSubjects([])
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userId')
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
      sendGlobalAnnouncement: (text) => {
        const normalized = text.trim()
        if (!normalized) return
        const recipients = users.filter((u) => u.role !== 'admin' && u.status === 'active')
        recipients.forEach((user) => {
          notify(user.id, normalized)
        })
      },
    }),
    [
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
      apiGrades,
      apiAbsences,
      apiRemarks,
      apiSchedule,
      apiSubjects,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}