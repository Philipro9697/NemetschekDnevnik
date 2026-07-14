"use client";

import { useMemo, useState, useEffect } from "react";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	CalendarDays,
	Loader2,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subjectById, classById } from "@/lib/data";
import { teacherService } from "@/api/teacherService";
import { ScheduleDto } from "@/api/types";

function formatDayLabel(offset: number) {
	const date = new Date();
	date.setDate(date.getDate() + offset);
	return date.toLocaleDateString("bg-BG", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
}

export function TeacherDiary() {
	const { users, setView, setSelectedClass } = useApp();
	const [query, setQuery] = useState("");
	const [dayOffset, setDayOffset] = useState(0);
	const [schedule, setSchedule] = useState<ScheduleDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch schedule from API on component mount
	useEffect(() => {
		let active = true;
		teacherService
			.getSchedule()
			.then((data) => {
				if (active) {
					setSchedule(data);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (active) {
					console.error("Failed to load schedule:", err);
					setError("Възникна грешка при зареждане на програмата.");
					setLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, []);

	const results = useMemo(() => {
		const value = query.trim().toLowerCase();
		if (!value) return [];
		return users
			.filter(
				(u) => u.role === "student" && u.name.toLowerCase().includes(value),
			)
			.slice(0, 6);
	}, [query, users]);

	// Map JS Date's getDay() to match API dayOfWeek (typically Monday = 1, Sunday = 7)
	const currentDayOfWeek = useMemo(() => {
		const date = new Date();
		date.setDate(date.getDate() + dayOffset);
		const day = date.getDay();
		return day === 0 ? 7 : day; // Treat Sunday as 7
	}, [dayOffset]);

	// Filter fetched schedule records for the selected day of the week
	const filteredLessons = useMemo(() => {
		return schedule.filter((item) => item.dayOfWeek === currentDayOfWeek);
	}, [schedule, currentDayOfWeek]);

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="rounded-[24px] border border-border bg-card/80 p-4 shadow-sm">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="font-heading text-xl font-bold">Програма</h2>
						<p className="text-sm text-muted-foreground">
							Планираните часове за избран ден са под формата на таблица.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDayOffset((value) => value - 1)}
						>
							<ChevronLeft className="size-4" /> Предишен
						</Button>
						<Button size="sm" onClick={() => setDayOffset(0)}>
							<CalendarDays className="size-4" /> Днес
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setDayOffset((value) => value + 1)}
						>
							Следващ <ChevronRight className="size-4" />
						</Button>
					</div>
				</div>
			</div>

			{results.length > 0 && (
				<div className="rounded-2xl border border-border bg-card p-4">
					<p className="mb-3 text-sm font-medium text-muted-foreground">
						Намерени ученици
					</p>
					<div className="grid gap-2">
						{results.map((student) => (
							<button
								key={student.id}
								type="button"
								onClick={() => {
									setSelectedClass(student.classId ?? null);
									setView("grades");
								}}
								className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-left text-sm"
							>
								<span>{student.name}</span>
								<Badge variant="neutral">{student.number}</Badge>
							</button>
						))}
					</div>
				</div>
			)}

			<div className="overflow-hidden rounded-2xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
					<div>
						<div className="text-sm font-semibold">
							{formatDayLabel(dayOffset)}
						</div>
						<div className="text-xs text-muted-foreground">Избран ден</div>
					</div>
					{!loading && !error && (
						<Badge variant="blue">{filteredLessons.length} часа</Badge>
					)}
				</div>

				{loading ? (
					<div className="flex h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" /> Зареждане на
						програмата...
					</div>
				) : error ? (
					<div className="p-4 text-center text-sm text-destructive">
						{error}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
								<tr>
									<th className="px-4 py-3">Време</th>
									<th className="px-4 py-3">Предмет</th>
									<th className="px-4 py-3">Преподавател</th>
									<th className="px-4 py-3">Стая</th>
								</tr>
							</thead>
							<tbody>
								{filteredLessons.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-8 text-center text-muted-foreground"
										>
											Няма планирани часове за този ден.
										</td>
									</tr>
								) : (
									filteredLessons.map((lesson) => (
										<tr
											key={lesson.scheduleId}
											className="border-t border-border/70"
										>
											<td className="px-4 py-3 font-medium">{lesson.time}</td>
											<td className="px-4 py-3">{lesson.subjectName}</td>
											<td className="px-4 py-3">
												{lesson.teacherFirstName} {lesson.teacherLastName}
											</td>
											<td className="px-4 py-3">{lesson.location || "—"}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
