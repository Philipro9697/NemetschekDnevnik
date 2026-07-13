'use client'

import { useEffect, useState } from 'react'
import { studentService } from '@/api/studentService'
import { userService } from '@/api/userService'
import type { AbsenceDto, GradeDto, RemarkDto, UserAccountDto} from '@/api/types'
import { useApp } from '@/components/app-provider'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { GradePill } from '@/components/shared/grade-pill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  subjects,
  subjectById,
  classById,
  schedule,
  userById,
  formatDate,
  type Grade,
  type User,
} from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  CalendarClock,
  TrendingUp,
  CircleAlert,
  MessageSquareText,
  CalendarDays,
  Sparkles,
} from 'lucide-react'

type ViewKey = 'grades' | 'absences' | 'schedule' | 'notes'

type DisplayAbsence = {
  id: string
  studentId: string
  subjectId: string
  date: string
  time?: string
  excused: boolean
  subjectName: string
}

type DisplayGrade = {
  id: string
  studentId: string
  subjectId: string
  teacherId: string
  value: number
  date: string
  time?: string
  description?: string
  subjectName: string
  teacherName: string
}

type DisplayRemark = {
  id: string
  text: string
  date: string
  kind: 'praise' | 'remark'
  teacherName: string
}

type DisplayStudentUserData = {
  id: string
  firstName: string
  lastName: string
}

function toDisplayAbsenceFromDto(dto: AbsenceDto, studentId: string): DisplayAbsence {
  return {
    id: `${studentId}-${dto.lessonId}-${dto.date}`,
    studentId,
    subjectId: `${dto.subjectId}`,
    date: dto.date,
    time: dto.time?.length ? dto.time.slice(0, 5) : undefined,
    excused: dto.isExcused,
    subjectName: dto.subjectName || 'Предмет',
  }
}

function toDisplayUserFromDto(dto: UserAccountDto): DisplayStudentUserData {
  return {
    id: `${dto.userId}`,
    firstName: dto.firstName,
    lastName: dto.lastName,
  }
}

function toDisplayGradeFromDto(dto: GradeDto, studentId: string): DisplayGrade {
  const teacherName = [dto.teacherFirstName, dto.teacherLastName].filter(Boolean).join(' ').trim() || 'Учител'

  return {
    id: `${studentId}-${dto.gradeId}`,
    studentId,
    subjectId: `${dto.subjectId}`,
    teacherId: `${dto.teacherId}`,
    value: Number(dto.gradeValue),
    date: dto.entryDate,
    description: dto.comment || dto.gradeTypeName,
    subjectName: dto.subjectName || 'Предмет',
    teacherName,
  }
}

function toDisplayRemark(dto: RemarkDto): DisplayRemark {
  const teacherName = [dto.teacherFirstName, dto.teacherLastName].filter(Boolean).join(' ').trim() || 'Учител'
  const kind = dto.type?.toLowerCase() === 'praise' ? 'praise' : 'remark'

  return {
    id: `${dto.remarkId}`,
    text: dto.text,
    date: dto.dateCreated,
    kind,
    teacherName,
  }
}

const views: { key: ViewKey; label: string; icon: React.ElementType }[] = [
  { key: 'grades', label: 'Оценки', icon: TrendingUp },
  { key: 'absences', label: 'Отсъствия', icon: CircleAlert },
  { key: 'schedule', label: 'Програма', icon: CalendarDays },
  { key: 'notes', label: 'Бележки', icon: MessageSquareText },
]

export function StudentDashboard({ student, hideHero }: { student?: User; hideHero?: boolean }) {
  const app = useApp()
  const me = student ?? app.currentUser
  const [activeView, setActiveView] = useState<ViewKey>('grades')
  const [, setView] = useState('dashboard')
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [dbGrades, setDbGrades] = useState<DisplayGrade[]>([])
  const [dbAbsences, setDbAbsences] = useState<DisplayAbsence[]>([])
  const [dbRemarks, setDbRemarks] = useState<DisplayRemark[]>([])
  const [dbUser, setDbUser] = useState<DisplayStudentUserData | null>(null)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingAbsences, setLoadingAbsences] = useState(false)
  const [loadingRemarks, setLoadingRemarks] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!app.currentUser || app.currentUser.role !== 'student' || Boolean(student)) {
      setDbGrades([])
      setDbAbsences([])
      setDbRemarks([])
      setDbUser(null)
      return () => {
        cancelled = true
      }
    }

    async function loadDashboardData() {
      setLoadingGrades(true)
      setLoadingAbsences(true)
      setLoadingRemarks(true)

      try {
        const [gradeData, absenceData, remarkData, userData] = await Promise.all([
          studentService.getGrades(),
          studentService.getAbsences(),
          studentService.getRemarks(),
          // studentId and userId refer to the same row for a student, so we can
          // look up their profile (first/last name) via the user endpoint.
          userService.getUserProfile(Number(app.currentUser!.id)),
        ])

        if (cancelled) return

        setDbGrades(gradeData.map((grade) => toDisplayGradeFromDto(grade, app.currentUser!.id)))
        setDbAbsences(absenceData.map((absence) => toDisplayAbsenceFromDto(absence, app.currentUser!.id)))
        setDbRemarks(remarkData.map(toDisplayRemark))
        setDbUser(toDisplayUserFromDto(userData))
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load dashboard data', error)
          setDbGrades([])
          setDbAbsences([])
          setDbRemarks([])
          setDbUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoadingGrades(false)
          setLoadingAbsences(false)
          setLoadingRemarks(false)
        }
      }
    }

  const activeView = (app.view as ViewKey) || "grades";
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

  const myGrades = app.apiGrades || [];
  const myAbsences = app.apiAbsences || [];
  const myRemarks = app.apiRemarks || [];
  const scheduleData = app.apiSchedule || [];
  const subjectsData = app.apiSubjects || [];

  if (!me) return null;

  const displayName = dbUser
    ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ').trim() || me.name
    : me.name

  const myGrades = dbGrades.length > 0
    ? dbGrades
    : app.grades
        .filter((g) => g.studentId === me.id)
        .map((grade) => ({
          id: grade.id,
          studentId: grade.studentId,
          subjectId: grade.subjectId,
          teacherId: grade.teacherId,
          value: grade.value,
          date: grade.date,
          time: grade.time,
          description: grade.description,
          subjectName: subjects.find((subject) => subject.id === grade.subjectId)?.name ?? 'Предмет',
          teacherName: userById(grade.teacherId, app.users)?.name ?? 'Учител',
        }))
  const myAbsences = dbAbsences.length > 0
    ? dbAbsences
    : app.absences
        .filter((a) => a.studentId === me.id)
        .map((absence) => ({
          id: absence.id,
          studentId: absence.studentId,
          subjectId: absence.subjectId,
          date: absence.date,
          time: absence.time,
          excused: absence.excused,
          subjectName: subjects.find((subject) => subject.id === absence.subjectId)?.name ?? 'Предмет',
        }))
  const myNotes = dbRemarks.length > 0
    ? dbRemarks
    : []

  const gradeVals = myGrades.map((g) => g.gradeValue);
  const avg =
    gradeVals.length > 0
      ? (gradeVals.reduce((a, b) => a + b, 0) / gradeVals.length).toFixed(2)
      : "—";
  const unexcused = myAbsences.filter((a) => !a.isExcused).length;
  const excused = myAbsences.filter((a) => a.isExcused).length;

  const gradesBySubject = subjectsData
    .map((s) => ({
      subject: s,
      grades: myGrades
        .filter((g) => g.subjectId === s.subjectId)
        .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1)),
    }))
    .filter((row) => row.grades.length > 0);

  const orderedRemarks = [...myRemarks].sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1));

  return (
    <div className="space-y-6">
      {!hideHero && (
        <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="size-3.5" />
                Учебно табло
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Здравей, {displayName}!
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {me.className ?? "Без клас"} · последни оценки, отсъствия и бележки на едно място.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Среден успех" value={avg} tone="primary" />
        <StatCard icon={CircleAlert} label="Неизвинени отсъствия" value={String(unexcused)} tone={unexcused > 0 ? "danger" : "success"} />
        <StatCard icon={CalendarClock} label="Извинени отсъствия" value={String(excused)} tone="warning" />
        <StatCard icon={MessageSquareText} label="Бележки и похвали" value={String(myRemarks.length)} tone="accent" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card/70 p-2 shadow-sm">
        {views.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => app.setView(item.key)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {activeView === "grades" && (
        <Card>
          <CardHeader>
            <CardTitle>Оценки по предмети</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {gradesBySubject.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Няма въведени оценки.</p>
            ) : (
              gradesBySubject.map((row) => (
                <div key={row.subject.subjectId} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{row.subject.subjectName}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {row.grades.map((g) => (
                        <button key={g.gradeId} onClick={() => setSelectedGrade(g)}>
                          <GradePill value={g.gradeValue} className="size-7 text-xs" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {activeView === "absences" && (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Обобщение на отсъствията</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                <span className="text-sm text-muted-foreground">Общо отсъствия</span>
                <Badge tone="warning">{myAbsences.length}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                <span className="text-sm text-muted-foreground">Извинени</span>
                <Badge tone="success">{excused}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
                <span className="text-sm text-muted-foreground">Неизвинени</span>
                <Badge tone="danger">{unexcused}</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Детайли</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {myAbsences.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Няма отсъствия.</p>
              ) : (
                myAbsences
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((a, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">Отсъствие</p>
                        <p className="text-xs text-muted-foreground">
                          {a.subjectName} · {a.date} · {a.time ?? "—"}
                        </p>
                      </div>
                      <Badge tone={a.isExcused ? "success" : "danger"}>
                        {a.isExcused ? "Извинено" : "Неизвинено"}
                      </Badge>
                    </div>
                  ))
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {activeView === "schedule" && (
        <Card className="overflow-hidden p-0">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Днешна програма</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {scheduleData.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Няма програма.</p>
            ) : (
              scheduleData.map((l, idx) => (
                <div key={idx} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="blue">{l.dayOfWeek}. час</Badge>
                    <span className="text-sm font-semibold text-primary">{l.time}</span>
                  </div>
                  <p className="font-semibold text-foreground">{l.subjectName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Каб. {l.location ?? "—"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {l.teacherFirstName} {l.teacherLastName}
                  </p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {activeView === "notes" && (
        <Card>
          <CardHeader>
            <CardTitle>Бележки и похвали</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {orderedRemarks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Няма записани бележки.</p>
            ) : (
              orderedRemarks.map((n, idx) => (
                <div key={idx} className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-foreground">{n.text}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {n.teacherFirstName} {n.teacherLastName} · {n.dateCreated}
                      </p>
                    </div>
                    <Badge tone={n.type === "praise" ? "success" : "danger"}>
                      {n.type === "praise" ? "Похвала" : "Забележка"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      )}

      {/* Grade Details Modal */}
      <Dialog open={Boolean(selectedGrade)} onClose={() => setSelectedGrade(null)} title="Детайли за оценка">
        {selectedGrade && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="font-semibold">{selectedGrade.subjectName}</div>
              <GradePill value={selectedGrade.gradeValue} className="size-8 text-sm" />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Дата</div>
              <div>{selectedGrade.entryDate}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Учител</div>
              <div>{selectedGrade.teacherFirstName} {selectedGrade.teacherLastName}</div>
            </div>
            {selectedGrade.comment && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground">
                {selectedGrade.comment}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "primary" | "success" | "danger" | "warning" | "accent";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/15 text-warning-foreground",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}