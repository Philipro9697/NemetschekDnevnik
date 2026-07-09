"use client"

import type { ReactNode } from "react"
import { useApp } from "@/components/app-provider"
import { LoginScreen } from "@/components/login-screen"
import { AppShell } from "@/components/layout/app-shell"
import { TeacherDiary } from "@/components/screens/teacher-diary"
import { TeacherGrades } from "@/components/screens/teacher-grades"
import { ClassTeacherPanel } from "@/components/screens/class-teacher-panel"
import { TeacherHomework } from "@/components/screens/teacher-homework"
import { StudentDashboard } from "@/components/screens/student-dashboard"
import { StudentGrades } from "@/components/screens/student-grades"
import { StudentAbsences } from "@/components/screens/student-absences"
import { StudentNotes } from "@/components/screens/student-notes"
import { StudentSchedule } from "@/components/screens/student-schedule"
import { StudentHomework } from "@/components/screens/student-homework"
import { ParentDashboard } from "@/components/screens/parent-dashboard"
import { ParentalControl } from "@/components/screens/parental-control"
import { AdminUsers } from "@/components/screens/admin-users"
import { AdminReports } from "@/components/screens/admin-reports"
import { CalendarScreen } from "@/components/screens/calendar-screen"
import { MessagesScreen } from "@/components/screens/messages-screen"
import { SettingsScreen } from "@/components/screens/settings-screen"
import type { User } from "@/lib/data"

export function Router() {
  const { currentUser, view, selectedChildId, users } = useApp()

  if (!currentUser) {
    return <LoginScreen />
  }

  const selectedChild =
    users.find((user) => user.id === selectedChildId) ??
    (currentUser?.role === 'parent'
      ? users.find((user) => currentUser.childrenIds?.includes(user.id)) ?? null
      : null)

  return <AppShell>{renderScreen(currentUser.role, view, selectedChild)}</AppShell>
}

function renderScreen(role: string, view: string, selectedChild: User | null): ReactNode {
  const resolvedSelectedChild = selectedChild ?? undefined
  // shared views
  if (view === "calendar") return <CalendarScreen />
  if (view === "messages") return <MessagesScreen />
  if (view === "settings") return <SettingsScreen />

  if (role === "teacher") {
    if (view === "grades") return <TeacherGrades />
    if (view === "classteacher") return <ClassTeacherPanel />
    if (view === "homework") return <TeacherHomework />
    return <TeacherDiary />
  }

  if (role === "student") {
    if (view === "homework") return <StudentHomework />
    if (view === "grades") return <StudentGrades />
    if (view === "absences") return <StudentAbsences />
    if (view === "notes") return <StudentNotes />
    if (view === "schedule") return <StudentSchedule />
    return <StudentDashboard />
  }

  if (role === "parent") {
    if (view === 'parental') return <ParentalControl />
    if (view === 'grades') return <StudentGrades student={resolvedSelectedChild} />
    if (view === 'absences') return <StudentAbsences student={resolvedSelectedChild} />
    if (view === 'notes') return <StudentNotes student={resolvedSelectedChild} />
    if (view === 'schedule') return <StudentSchedule student={resolvedSelectedChild} />
    if (view === 'homework') return <StudentHomework student={resolvedSelectedChild} />
    return <ParentDashboard />
  }

  // admin
  if (view === "reports") return <AdminReports />
  return <AdminUsers />
}
