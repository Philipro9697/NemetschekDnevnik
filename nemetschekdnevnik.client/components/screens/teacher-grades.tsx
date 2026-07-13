"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Search,
	GraduationCap,
	Sparkles,
	Plus,
	ChevronDown,
	BookOpenCheck,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { GradePill } from "@/components/shared/grade-pill";
import { teacherService } from "@/api/teacherService";
import type {
	AbsenceDto,
	ClassDto,
	GradeDto,
	StudentInfoDto,
	SubjectDto,
	RemarkDto,
} from "@/api/types";
import { cn } from "@/lib/utils";

// Same 5 sections/labels as student-grades.tsx, so the grade-term visuals match everywhere.
// The backend has no concept of grade terms/sections — it only stores a flat value + comment.
// To keep the term columns without a backend change, the section is tagged onto the front of
// the comment string (e.g. "§term1Final§great work") and stripped back out for display.
type GradeSection = "term1" | "term1Final" | "term2" | "term2Final" | "yearly";

const gradeSections: { key: GradeSection; label: string }[] = [
	{ key: "term1", label: "1ви срок" },
	{ key: "term1Final", label: "Срочна 1ви" },
	{ key: "term2", label: "2ри срок" },
	{ key: "term2Final", label: "Срочна 2ри" },
	{ key: "yearly", label: "Годишна" },
];

const SECTION_TAG_RE = /^§(term1Final|term2Final|term1|term2|yearly)§/;

function encodeComment(section: GradeSection, text: string) {
	return `§${section}§${text}`;
}

// Grades added before this scheme existed (or via a raw API call) have no tag —
// they default to 'term1' so they still show up somewhere instead of disappearing.
function decodeComment(comment: string | null | undefined): {
	section: GradeSection;
	text: string;
} {
	if (!comment) return { section: "term1", text: "" };
	const match = comment.match(SECTION_TAG_RE);
	if (!match) return { section: "term1", text: comment };
	return {
		section: match[1] as GradeSection,
		text: comment.slice(match[0].length),
	};
}

export function TeacherGrades() {
	// Notes/absences have no backend endpoint yet, so they still come from the mock context.
	const { notes, absences, addAbsence, addNote } = useApp();

	const [query, setQuery] = useState("");

	const [classesList, setClassesList] = useState<ClassDto[]>([]);
	const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
	const [students, setStudents] = useState<StudentInfoDto[]>([]);
	const [grades, setGrades] = useState<GradeDto[]>([]);

	const [subjectOptions, setSubjectOptions] = useState<SubjectDto[]>([]);
	const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
		null,
	);
	const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);

	const [gradeTarget, setGradeTarget] = useState<{
		studentId: number;
		section: GradeSection;
	} | null>(null);
	const [gradeValue, setGradeValue] = useState(5);
	const [gradeDescription, setGradeDescription] = useState("");
	const [selectedGrade, setSelectedGrade] = useState<GradeDto | null>(null);

	const [noteTarget, setNoteTarget] = useState<{
		studentId: string;
		subjectId: string;
	} | null>(null);
	const [noteKind, setNoteKind] = useState<"praise" | "remark">("praise");
	const [noteText, setNoteText] = useState("");
	const [notesPopupTarget, setNotesPopupTarget] = useState<{
		studentId: string;
		subjectId: string;
	} | null>(null);

	const [absenceTarget, setAbsenceTarget] = useState<{
		studentId: string;
		subjectId: string;
	} | null>(null);
	const [absenceExcused, setAbsenceExcused] = useState(false);
	const [absencesPopupTarget, setAbsencesPopupTarget] = useState<{
		studentId: string;
		subjectId: string;
	} | null>(null);

	function currentTime() {
		return new Date().toTimeString().slice(0, 5);
	}
	function currentDate() {
		return new Date().toDateString();
	}
	// Load the teacher's classes + subjects once.
	useEffect(() => {
		teacherService
			.getClasses()
			.then((data) => {
				setClassesList(data);
				if (data.length > 0)
					setSelectedClassId((prev) => prev ?? data[0].classId);
			})
			.catch((err) =>
				console.error(
					"Failed to load classes (are you logged in with a real account?):",
					err,
				),
			);
		teacherService
			.getSubjects()
			.then((data) => {
				setSubjectOptions(data);
				if (data.length > 0)
					setSelectedSubjectId((prev) => prev ?? data[0].subjectId);
			})
			.catch((err) => console.error("Failed to load subjects:", err));
	}, []);

	// Reload roster + grades whenever the selected class changes.
	useEffect(() => {
		if (selectedClassId === null) return;
		teacherService
			.getStudents(selectedClassId)
			.then(setStudents)
			.catch((err) => console.error("Failed to load students:", err));
		teacherService
			.getGrades(selectedClassId)
			.then(setGrades)
			.catch((err) => console.error("Failed to load grades:", err));
	}, [selectedClassId]);

	const selectedClass =
		classesList.find((c) => c.classId === selectedClassId) ?? null;
	const selectedSubject =
		subjectOptions.find((s) => s.subjectId === selectedSubjectId) ?? null;

	const filteredStudents = useMemo(() => {
		return query.trim()
			? students.filter((s) =>
				`${s.firstName} ${s.lastName}`
					.toLowerCase()
					.includes(query.trim().toLowerCase()),
			)
			: students;
	}, [students, query]);

	function openGradeDialog(studentId: number, section: GradeSection) {
		setGradeTarget({ studentId, section });
		setGradeValue(5);
		setGradeDescription("");
	}

	function openNoteDialog(studentId: number) {
		setNoteTarget({
			studentId: String(studentId),
			subjectId: String(selectedSubjectId ?? ""),
		});
		setNoteText("");
		setNoteKind("praise");
	}

	function openAbsenceDialog(studentId: number) {
		setAbsenceTarget({
			studentId: String(studentId),
			subjectId: String(selectedSubjectId ?? ""),
		});
		setAbsenceExcused(false);
	}

	async function handleSubmitGrade() {
		if (!gradeTarget || selectedSubjectId === null) return;
		const created = await teacherService.addGrade({
			studentId: gradeTarget.studentId,
			subjectId: selectedSubjectId,
			teacherId: 0, // ignored by the backend; it uses the logged-in teacher from the JWT
			value: gradeValue,
			comment: encodeComment(gradeTarget.section, gradeDescription.trim()),
		});
		setGrades((prev) => [created, ...prev]);
		setGradeTarget(null);
	}

	function handleSubmitNote() {
		if (!noteTarget) return;
		addNote({
			studentId: noteTarget.studentId,
			subjectId: noteTarget.subjectId,
			teacherId: "",
			text: noteText.trim(),
			kind: noteKind,
			time: currentTime(),
		});

		teacherService.addRemark({
			studentId: parseInt(noteTarget.studentId),
			subjectId: parseInt(noteTarget.subjectId),
			type: noteKind,
			text: noteText.trim(),

			teacherId: -1, // determined by backend
			remarkId: -1,
			dateCreated: "2012-04-23T18:25:43.511Z",
			teacherFirstName: "giga",
			teacherLastName: "niga",
		} as RemarkDto);

		setNoteTarget(null);
	}

	function handleSubmitAbsence() {
		if (!absenceTarget) return;
		addAbsence({
			studentId: absenceTarget.studentId,
			subjectId: absenceTarget.subjectId,
			teacherId: "",
			type: "absent",
			excused: absenceExcused,
			time: currentTime(),
		});

		teacherService.addAbsence({
			studentId: parseInt(absenceTarget.studentId),
			subjectId: parseInt(absenceTarget.subjectId),
			isExcused: absenceExcused,

			date: "2026-07-13",
			time: "14:30:00",
			subjectName: "niga",
			lessonId: 1,
		} as AbsenceDto);

		setAbsenceTarget(null);
	}

	function studentName(studentId: string) {
		const s = students.find((st) => String(st.studentId) === studentId);
		return s ? `${s.firstName} ${s.lastName}` : "";
	}

	return (
		<div className="space-y-6">
			<div className="rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm sm:p-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
							<Sparkles className="size-3.5" /> Дневник
						</div>
						<h2 className="font-heading text-2xl font-bold">
							Управление на оценки, бележки и отсъствия
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Избери клас и предмет, след което редактирай таблицата за всеки
							ученик.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{classesList.map((klass) => (
							<Button
								key={klass.classId}
								variant={
									selectedClassId === klass.classId ? "default" : "outline"
								}
								size="sm"
								onClick={() => setSelectedClassId(klass.classId)}
							>
								{klass.classGrade}
								{klass.classLetter}
							</Button>
						))}
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-3">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<GraduationCap className="size-4 text-primary" /> Преглед за{" "}
					{selectedClass
						? `${selectedClass.classGrade}${selectedClass.classLetter}`
						: "клас"}
				</div>
				<div className="flex items-center gap-3">
					<div className="relative">
						<button
							type="button"
							onClick={() => setSubjectMenuOpen((prev) => !prev)}
							className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
						>
							<BookOpenCheck className="size-4 text-primary" /> Оценки -{" "}
							{selectedSubject?.subjectName ?? "Предмет"}
							<ChevronDown
								className={cn(
									"size-4 transition-transform",
									subjectMenuOpen && "rotate-180",
								)}
							/>
						</button>
						{subjectMenuOpen && (
							<div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
								{subjectOptions.map((subject) => (
									<button
										key={subject.subjectId}
										type="button"
										onClick={() => {
											setSelectedSubjectId(subject.subjectId);
											setSubjectMenuOpen(false);
										}}
										className="flex w-full items-start rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
									>
										<span className="font-medium">{subject.subjectName}</span>
									</button>
								))}
							</div>
						)}
					</div>
					<div className="text-sm text-muted-foreground">
						Общо ученици: {filteredStudents.length}
					</div>
				</div>
			</div>

			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Търси ученик"
					className="pl-9"
				/>
			</div>

			<Card className="overflow-hidden border-primary/10">
				<CardHeader>
					<CardTitle>Оценки по ученици</CardTitle>
					<p className="text-sm text-muted-foreground">
						Тази таблица показва оценките на всеки ученик по срокове за избрания
						предмет.
					</p>
				</CardHeader>
				<CardBody className="p-0">
					{filteredStudents.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							Няма ученици в този клас.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
									<tr>
										<th className="w-[220px] px-4 py-3">Ученик</th>
										{gradeSections.map((section) => (
											<th
												key={section.key}
												className="border-l border-border/70 px-4 py-3 text-center"
											>
												{section.label}
											</th>
										))}
										<th className="w-[130px] border-l border-border/70 px-4 py-3">
											Бележки
										</th>
										<th className="w-[130px] border-l border-border/70 px-4 py-3">
											Отсъствия
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredStudents.map((student) => {
										const studentGrades = grades.filter(
											(g) =>
												g.studentId === student.studentId &&
												g.subjectId === selectedSubjectId,
										);
										const studentIdStr = String(student.studentId);
										const studentNotes = notes.filter(
											(n) =>
												n.studentId === studentIdStr &&
												n.subjectId === String(selectedSubjectId ?? ""),
										);
										const studentAbsences = absences.filter(
											(a) =>
												a.studentId === studentIdStr &&
												a.subjectId === String(selectedSubjectId ?? ""),
										);
										return (
											<tr
												key={student.studentId}
												className="border-t border-border/70"
											>
												<td className="px-4 py-3 align-top">
													<div className="font-medium text-foreground">
														{student.firstName} {student.lastName}
													</div>
													<div className="mt-1 text-xs text-muted-foreground">
														{studentGrades.length} оценка
														{studentGrades.length === 1 ? "" : "и"}
													</div>
												</td>
												{gradeSections.map((section) => {
													const sectionGrades = studentGrades.filter(
														(g) =>
															decodeComment(g.comment).section === section.key,
													);
													return (
														<td
															key={section.key}
															className="border-l border-border/70 px-4 py-3 align-top"
														>
															<div className="flex flex-wrap items-center gap-1">
																{sectionGrades.length === 0 ? (
																	<span className="text-[11px] text-muted-foreground">
																		—
																	</span>
																) : (
																	sectionGrades.map((g) => (
																		<button
																			key={g.gradeId}
																			type="button"
																			onClick={() => setSelectedGrade(g)}
																			className="rounded-md border border-border/70 bg-background/80 p-0.5"
																		>
																			<GradePill
																				value={g.gradeValue}
																				title={`${selectedSubject?.subjectName ?? ""} · ${g.entryDate}`}
																				className="size-5 text-[0.65rem]"
																			/>
																		</button>
																	))
																)}
																<button
																	type="button"
																	onClick={() =>
																		openGradeDialog(
																			student.studentId,
																			section.key,
																		)
																	}
																	className="rounded-md p-0.5 text-primary hover:bg-muted"
																>
																	<Plus className="size-3.5" />
																</button>
															</div>
														</td>
													);
												})}
												<td className="border-l border-border/70 px-4 py-3 align-top">
													<div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
														<button
															type="button"
															onClick={() =>
																setNotesPopupTarget({
																	studentId: studentIdStr,
																	subjectId: String(selectedSubjectId ?? ""),
																})
															}
															className="rounded-md px-2 py-1 text-sm font-semibold text-foreground hover:bg-background"
														>
															{studentNotes.length}
														</button>
														<button
															type="button"
															onClick={() => openNoteDialog(student.studentId)}
															className="rounded-md p-1 text-primary hover:bg-background"
														>
															<Plus className="size-3.5" />
														</button>
													</div>
												</td>
												<td className="border-l border-border/70 px-4 py-3 align-top">
													<div className="flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-muted/20 px-2 py-1.5">
														<button
															type="button"
															onClick={() =>
																setAbsencesPopupTarget({
																	studentId: studentIdStr,
																	subjectId: String(selectedSubjectId ?? ""),
																})
															}
															className="rounded-md px-2 py-1 text-sm font-semibold text-danger hover:bg-background"
														>
															{studentAbsences.length}
														</button>
														<button
															type="button"
															onClick={() =>
																openAbsenceDialog(student.studentId)
															}
															className="rounded-md p-1 text-danger hover:bg-background"
														>
															<Plus className="size-3.5" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</CardBody>
			</Card>

			<Dialog
				open={Boolean(gradeTarget)}
				onClose={() => setGradeTarget(null)}
				title="Добави оценка"
			>
				<div className="space-y-4">
					<div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
						<div className="font-semibold text-foreground">
							{selectedSubject?.subjectName ?? "Предмет"}
						</div>
						<div className="mt-1">
							{gradeTarget
								? gradeSections.find((s) => s.key === gradeTarget.section)
									?.label
								: ""}
						</div>
					</div>
					<div>
						<label className="mb-1.5 block text-sm font-medium">Оценка</label>
						<select
							value={gradeValue}
							onChange={(e) => setGradeValue(Number(e.target.value))}
							className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
						>
							{[2, 3, 4, 5, 6].map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1.5 block text-sm font-medium">Описание</label>
						<Input
							value={gradeDescription}
							onChange={(e) => setGradeDescription(e.target.value)}
							placeholder="Напр. Контролно по дроби"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setGradeTarget(null)}>
							Връщане назад
						</Button>
						<Button onClick={handleSubmitGrade}>Добави оценка</Button>
					</div>
				</div>
			</Dialog>

			<Dialog
				open={Boolean(noteTarget)}
				onClose={() => setNoteTarget(null)}
				title="Добави бележка"
			>
				<div className="space-y-4">
					<div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
						{noteTarget && (
							<div className="font-semibold text-foreground">
								{studentName(noteTarget.studentId)}
							</div>
						)}
					</div>
					<div className="flex gap-2">
						<Button
							variant={noteKind === "praise" ? "default" : "outline"}
							onClick={() => setNoteKind("praise")}
						>
							Похвала
						</Button>
						<Button
							variant={noteKind === "remark" ? "default" : "outline"}
							onClick={() => setNoteKind("remark")}
						>
							Забележка
						</Button>
					</div>
					<div>
						<label className="mb-1.5 block text-sm font-medium">Описание</label>
						<Input
							value={noteText}
							onChange={(e) => setNoteText(e.target.value)}
							placeholder="Опиши бележката"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setNoteTarget(null)}>
							Връщане назад
						</Button>
						<Button onClick={handleSubmitNote}>Добави бележка</Button>
					</div>
				</div>
			</Dialog>

			<Dialog
				open={Boolean(absenceTarget)}
				onClose={() => setAbsenceTarget(null)}
				title="Добави отсъствие"
			>
				<div className="space-y-4">
					<div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
						{absenceTarget && (
							<div className="font-semibold text-foreground">
								{studentName(absenceTarget.studentId)}
							</div>
						)}
					</div>
					<div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
						Ще се добави отсъствие за ученика.
					</div>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={absenceExcused}
							onChange={(e) => setAbsenceExcused(e.target.checked)}
						/>
						Извинено
					</label>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setAbsenceTarget(null)}>
							Връщане назад
						</Button>
						<Button onClick={handleSubmitAbsence}>Добави отсъствие</Button>
					</div>
				</div>
			</Dialog>

			<Dialog
				open={Boolean(selectedGrade)}
				onClose={() => setSelectedGrade(null)}
				title="Детайли за оценка"
			>
				{selectedGrade && (
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
							<div className="font-semibold">
								{selectedGrade.studentFirstName} {selectedGrade.studentLastName}
							</div>
							<GradePill
								value={selectedGrade.gradeValue}
								className="size-8 text-sm"
							/>
						</div>
						<div className="rounded-lg border border-border bg-muted/30 p-3">
							<div className="text-xs uppercase tracking-wide text-muted-foreground">
								Период
							</div>
							<div>
								{
									gradeSections.find(
										(s) =>
											s.key === decodeComment(selectedGrade.comment).section,
									)?.label
								}
							</div>
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
								{selectedGrade.teacherFirstName} {selectedGrade.teacherLastName}
							</div>
						</div>
						<div className="rounded-lg border border-border bg-muted/30 p-3">
							<div className="text-xs uppercase tracking-wide text-muted-foreground">
								Предмет
							</div>
							<div>{selectedGrade.subjectName}</div>
						</div>
						{decodeComment(selectedGrade.comment).text && (
							<div className="rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground">
								{decodeComment(selectedGrade.comment).text}
							</div>
						)}
					</div>
				)}
			</Dialog>

			<Dialog
				open={Boolean(notesPopupTarget)}
				onClose={() => setNotesPopupTarget(null)}
				title="Бележки"
			>
				{notesPopupTarget && (
					<div className="space-y-2 text-sm">
						{notes.filter(
							(note) =>
								note.studentId === notesPopupTarget.studentId &&
								note.subjectId === notesPopupTarget.subjectId,
						).length === 0 ? (
							<div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-muted-foreground">
								Няма бележки.
							</div>
						) : (
							notes
								.filter(
									(note) =>
										note.studentId === notesPopupTarget.studentId &&
										note.subjectId === notesPopupTarget.subjectId,
								)
								.map((note) => (
									<div
										key={note.id}
										className="rounded-lg border border-border bg-muted/30 p-3"
									>
										<div className="mb-1 flex items-center justify-between gap-2">
											<Badge
												variant={note.kind === "praise" ? "green" : "warning"}
											>
												{note.kind === "praise" ? "Похвала" : "Забележка"}
											</Badge>
											<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
												{note.date} · {note.time ?? "—"}
											</span>
										</div>
										<div className="text-sm">{note.text}</div>
									</div>
								))
						)}
					</div>
				)}
			</Dialog>

			<Dialog
				open={Boolean(absencesPopupTarget)}
				onClose={() => setAbsencesPopupTarget(null)}
				title="Отсъствия"
			>
				{absencesPopupTarget && (
					<div className="space-y-2 text-sm">
						{absences.filter(
							(absence) =>
								absence.studentId === absencesPopupTarget.studentId &&
								absence.subjectId === absencesPopupTarget.subjectId,
						).length === 0 ? (
							<div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-center text-muted-foreground">
								Няма отсъствия.
							</div>
						) : (
							absences
								.filter(
									(absence) =>
										absence.studentId === absencesPopupTarget.studentId &&
										absence.subjectId === absencesPopupTarget.subjectId,
								)
								.map((absence) => (
									<div
										key={absence.id}
										className="rounded-lg border border-border bg-muted/30 p-3"
									>
										<div className="mb-1 flex items-center justify-between gap-2">
											<span className="font-medium text-danger">Отсъствие</span>
											<Badge tone={absence.excused ? "success" : "danger"}>
												{absence.excused ? "Извинено" : "Неизвинено"}
											</Badge>
										</div>
										<div className="text-xs uppercase tracking-wide text-muted-foreground">
											{absence.date} · {absence.time ?? "—"}
										</div>
									</div>
								))
						)}
					</div>
				)}
			</Dialog>
		</div>
	);
}
