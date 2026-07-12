"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/components/app-provider";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { GradePill } from "@/components/shared/grade-pill";
import {
	classById,
	formatDate,
	subjectById,
	subjects,
	type Grade,
	type GradeSection,
	type User,
} from "@/lib/data";
import { TrendingUp, Sparkles } from "lucide-react";
import { studentService } from "@/api/studentService";
import { GradeDto, SubjectDto } from "@/api/types";

const gradeSections: { key: GradeSection; label: string }[] = [
	{ key: "Текущо изпитване", label: "1ви срок" },
	{ key: "term1Final", label: "Срочна 1ви" },
	{ key: "term2", label: "2ри срок" },
	{ key: "term2Final", label: "Срочна 2ри" },
	{ key: "yearly", label: "Годишна" },
];

export function StudentGrades({ student }: { student?: User }) {
	const app = useApp();
	const me =
		student ?? (app.currentUser?.role === "student" ? app.currentUser : null);
	const [selectedGrade, setSelectedGrade] = useState<GradeDto | null>(null);
	if (!me) return null;

	const [myGrades, setMyGrades] = useState<GradeDto[]>([]);
	const [subjects, setSubjects] = useState<SubjectDto[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([studentService.getGrades(), studentService.getSubjects()])
			.then(([graderes, subjectres]) => {
				setMyGrades(graderes || []);
				setSubjects(subjectres);
			})
			.catch((err) => console.error("Error fetching schedule:", err))
			.finally(() => setLoading(false));
	}, []);

	const avg =
		myGrades.length > 0
			? (
				myGrades.reduce((a, g) => a + g.gradeValue, 0) / myGrades.length
			).toFixed(2)
			: "—";

	const gradesBySubject = subjects
		.map((subject) => ({
			subject,
			grades: myGrades
				.filter((g) => g.subjectId === subject.subjectId)
				.sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1)),
		}))
		.filter((row) => row.grades.length > 0);

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
							<Sparkles className="size-3.5" /> Оценки
						</div>
						<h2 className="font-heading text-2xl font-bold">
							Оценките на {me.name}
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							{classById(me.classId)?.name ?? "Без клас"} · среден успех {avg}
						</p>
					</div>
					<div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
						<p className="flex items-center gap-2 font-medium text-foreground">
							<TrendingUp className="size-4 text-primary" /> Среден успех
						</p>
						<p className="mt-1 font-heading text-xl font-semibold text-primary">
							{avg}
						</p>
					</div>
				</div>
			</div>

			<Card className="overflow-hidden border-primary/10">
				<CardHeader>
					<CardTitle>Оценки по предмети</CardTitle>
					<p className="text-sm text-muted-foreground">
						Тази таблица показва оценките ти по предмети и срокове.
					</p>
				</CardHeader>
				<CardBody className="p-0">
					{gradesBySubject.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							Все още няма оценки.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
									<tr>
										<th className="w-[240px] px-4 py-3">Предмет</th>
										{gradeSections.map((section) => (
											<th
												key={section.key}
												className="border-l border-border/70 px-4 py-3 text-center"
											>
												{section.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{gradesBySubject.map(({ subject, grades }) => (
										<tr
											key={subject.subjectId}
											className="border-t border-border/70"
										>
											<td className="px-4 py-3 align-top">
												<div className="font-medium text-foreground">
													{subject.subjectName}
												</div>
												<div className="mt-1 text-xs text-muted-foreground">
													{grades.length} оценка{grades.length === 1 ? "" : "и"}
												</div>
											</td>
											{gradeSections.map((section) => {
												const sectionGrades = grades.filter(
													(g) => g.gradeTypeName == section.key,
												);
												return (
													<td
														key={section.key}
														className="border-l border-border/70 px-4 py-3 align-top"
													>
														{sectionGrades.length > 0 ? (
															<div className="flex flex-wrap gap-1">
																{sectionGrades.map((g) => (
																	<button
																		key={g.gradeId}
																		type="button"
																		onClick={() => setSelectedGrade(g)}
																		className="rounded-md border border-border/70 bg-background/80 p-0.5"
																	>
																		<GradePill
																			value={g.gradeValue}
																			title={`${subjects.find((s) => {
																				s.subjectId === g.subjectId;
																			})?.subjectName
																				} · ${formatDate(g.entryDate)}`}
																			className="size-5 text-[0.65rem]"
																		/>
																	</button>
																))}
															</div>
														) : (
															<span className="text-[11px] text-muted-foreground">
																—
															</span>
														)}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardBody>
			</Card>

			<Dialog
				open={Boolean(selectedGrade)}
				onClose={() => setSelectedGrade(null)}
				title="Детайли за оценка"
			>
				{selectedGrade && (
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
							<div className="font-semibold">
								{
									subjects.find((s) => s.subjectId === selectedGrade.subjectId)!
										.subjectName
								}
							</div>
							<GradePill
								value={selectedGrade.gradeValue}
								className="size-8 text-sm"
							/>
						</div>
						<div className="rounded-lg border border-border bg-muted/30 p-3">
							<div className="text-xs uppercase tracking-wide text-muted-foreground">
								Дата
							</div>
							<div>{selectedGrade.entryDate}</div>
						</div>
						<div className="rounded-lg border border-border bg-muted/30 p-3">
							<div className="text-xs uppercase tracking-wide text-muted-foreground">
								Учител
							</div>
							<div>
								{selectedGrade.teacherFirstName +
									" " +
									selectedGrade.teacherLastName}
							</div>
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