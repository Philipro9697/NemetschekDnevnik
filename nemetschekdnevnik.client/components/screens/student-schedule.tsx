"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/data";
import { CalendarDays, Sparkles } from "lucide-react";
import { studentService } from "@/api/studentService";
import { parentService } from "@/api/parentService";
import { ScheduleDto } from "@/api/types";

const WEEK_DAYS = [
    { key: "monday", label: "Понеделник", value: 1 },
    { key: "tuesday", label: "Вторник", value: 2 },
    { key: "wednesday", label: "Сряда", value: 3 },
    { key: "thursday", label: "Четвъртък", value: 4 },
    { key: "friday", label: "Петък", value: 5 },
];

export function StudentSchedule({ student }: { student?: User } = {}) {
    const [schedule, setSchedule] = useState<ScheduleDto[]>([]);
    const [selectedDay, setSelectedDay] = useState("monday");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        // Динамичен избор според това дали компонентът е зареден от родител или ученик
        const fetchSchedule = student && student.id
            ? parentService.getChildSchedule(Number(student.id)) // Маршрутът от C#: "schedule/{id}"
            : studentService.getSchedule();

        fetchSchedule
            .then((data) => {
                if (isMounted) {
                    setSchedule(data || []);
                }
            })
            .catch((err) => console.error("Error fetching schedule:", err))
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [student?.id]); // Правилно следи за промяна на избраното дете/ученик

    const currentDayConfig = WEEK_DAYS.find((d) => d.key === selectedDay);

    const daySchedule = useMemo(() => {
        if (!currentDayConfig) return [];
        return schedule.filter((item) => item.dayOfWeek === currentDayConfig.value);
    }, [schedule, selectedDay, currentDayConfig]);

    if (loading) {
        return (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Зареждане на програмата...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            <Sparkles className="size-3.5" /> Програма за седмицата
                        </div>
                        <h2 className="font-heading text-2xl font-bold">
                            {student
                                ? `Седмична програма на ${student.name}`
                                : "Седмична програма"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Изберете ден за подробен преглед
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2 font-medium text-foreground">
                            <CalendarDays className="size-4 text-success" />{" "}
                            {currentDayConfig?.label}
                        </p>
                        <p className="mt-1 font-heading text-xl font-semibold text-success">
                            {daySchedule.length} {daySchedule.length !== 1 ? "часа" : "час"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {WEEK_DAYS.map((day) => (
                    <Button
                        key={day.key}
                        variant={selectedDay === day.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDay(day.key)}
                    >
                        {day.label}
                    </Button>
                ))}
            </div>

            <Card className="overflow-hidden p-0">
                <CardHeader className="border-b border-border/70">
                    <CardTitle>Часове за {currentDayConfig?.label}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Табличен преглед с предмети, учители и кабинет.
                    </p>
                </CardHeader>
                <CardBody className="overflow-x-auto p-0">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Предмет</th>
                                <th className="px-4 py-3">Учител</th>
                                <th className="px-4 py-3">Кабинет</th>
                                <th className="px-4 py-3">Време</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daySchedule.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        Няма часове за този ден.
                                    </td>
                                </tr>
                            ) : (
                                daySchedule.map((lesson, idx) => (
                                    <tr
                                        key={`${selectedDay}-${idx}`}
                                        className="border-t border-border/70"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {lesson.subjectName}
                                        </td>
                                        <td className="px-4 py-3">
                                            {lesson.teacherFirstName} {lesson.teacherLastName}
                                        </td>
                                        <td className="px-4 py-3">{lesson.location || "—"}</td>
                                        <td className="px-4 py-3">{lesson.time}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </div>
    );
}