"use client";

import { useMemo, useState, useEffect } from "react";
import {
	Plus,
	FileCheck2,
	ClipboardList,
	Sparkles,
	Search,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, type User } from "@/lib/data";
import { teacherService } from "@/api/teacherService";
import { HomeworkItemDto, SubjectDto, ClassDto } from "@/api/types";

export function TeacherHomework() {
	const { currentUser, addFeedback, users, selectedClassId, setSelectedClass } =
		useApp();
	const [creating, setCreating] = useState(false);
	const [query, setQuery] = useState("");

	// API states
	const [apiSubjects, setApiSubjects] = useState<SubjectDto[]>([]);
	const [apiClasses, setApiClasses] = useState<ClassDto[]>([]);
	const [apiHomework, setApiHomework] = useState<HomeworkItemDto[]>([]);

	// 1. Fetch subjects and classes on mount from teacherService
	useEffect(() => {
		teacherService
			.getSubjects()
			.then((data) => setApiSubjects(data))
			.catch((err) => console.error("Failed to fetch subjects:", err));

		teacherService
			.getClasses()
			.then((data) => setApiClasses(data))
			.catch((err) => console.error("Failed to fetch classes:", err));
	}, []);

	// 2. Fetch homework for selected class from teacherService when selectedClassId changes
	useEffect(() => {
		if (!selectedClassId) {
			setApiHomework([]);
			return;
		}
		teacherService
			.getHomework(parseInt(selectedClassId, 10))
			.then((data) => setApiHomework(data))
			.catch((err) =>
				console.error("Failed to fetch homework for class:", err),
			);
	}, [selectedClassId]);

	const filteredHomework = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return apiHomework;
		return apiHomework.filter(
			(h) =>
				h.title.toLowerCase().includes(q) ||
				h.description.toLowerCase().includes(q),
		);
	}, [apiHomework, query]);

	const canCreate =
		currentUser?.role === "teacher" || currentUser?.role === "admin";

	return (
		<div className="space-y-6">
			<div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
							<Sparkles className="size-3.5" /> Управление на задачи
						</div>
						<h2 className="font-heading text-xl font-bold">Домашни</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Учителите добавят домашни задачи за избран клас и предмет.
						</p>
					</div>
					{canCreate && (
						<Button
							onClick={() => setCreating(true)}
							disabled={!selectedClassId}
						>
							<Plus className="size-4" /> Добави домашна работа
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full sm:w-72">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Търси задача"
						className="h-10 pl-9"
					/>
				</div>
				<div className="min-w-[220px] flex-1 sm:flex-none">
					<label className="mb-1.5 block text-sm font-medium">
						Избери клас
					</label>
					<select
						value={selectedClassId ?? ""}
						onChange={(e) => setSelectedClass(e.target.value || null)}
						className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
					>
						<option value="">— Избери клас —</option>
						{apiClasses.map((klass) => (
							<option key={klass.classId} value={klass.classId}>
								{klass.classGrade}
								{klass.classLetter}
							</option>
						))}
					</select>
				</div>
			</div>

			{!selectedClassId ? (
				<Card className="p-10 text-center text-muted-foreground">
					Избери клас, за да видиш домашните задачи за него.
				</Card>
			) : filteredHomework.length === 0 ? (
				<Card className="p-10 text-center text-muted-foreground">
					Все още няма добавени домашни работи за избрания клас.
				</Card>
			) : (
				<div className="space-y-4">
					{filteredHomework.map((h) => (
						<HomeworkCard
							key={h.homeworkId}
							hw={h}
							onFeedback={addFeedback}
							users={users}
							classes={apiClasses}
							subjects={apiSubjects}
						/>
					))}
				</div>
			)}

			{creating && selectedClassId && (
				<CreateTaskDialog
					subjects={apiSubjects}
					classId={selectedClassId}
					classes={apiClasses}
					onClose={() => setCreating(false)}
					onCreate={async (data) => {
						try {
							const todayIso = new Date().toISOString().split("T")[0];
							const dueIso = data.dueDate
								? new Date(data.dueDate).toISOString().split("T")[0]
								: todayIso;

							const payload: HomeworkItemDto = {
								homeworkId: 0,
								classId: parseInt(selectedClassId, 10),
								subjectId: parseInt(data.subjectId, 10),
								teacherId: parseInt(currentUser?.id || "1", 10),
								title: data.title,
								description: data.description,
								resourceLink: data.resourceLink, // Fixes link missing in database save
								dateAssigned: todayIso,
								dateDue: dueIso,
							};

							// Save to API database
							const newHomework = await teacherService.addHomework(payload);

							// Push directly into local state to show instantly using the database response
							setApiHomework((prev) => [...prev, newHomework]);
							console.log("Homework submitted successfully.");
						} catch (error) {
							console.error("Failed to post homework to database:", error);
						}

						setCreating(false);
					}}
				/>
			)}
		</div>
	);
}

function HomeworkCard({
	hw,
	onFeedback,
	users,
	classes,
	subjects,
}: {
	hw: HomeworkItemDto;
	onFeedback: (id: string, studentId: string, fb: string) => void;
	users: User[];
	classes: ClassDto[];
	subjects: SubjectDto[];
}) {
	const subjectName =
		subjects.find((s) => s.subjectId === hw.subjectId)?.subjectName ||
		"Предмет";
	const targetClass = classes.find((c) => c.classId === hw.classId);
	const className = targetClass
		? `${targetClass.classGrade}${targetClass.classLetter}`
		: "";

	// Handle submissions safely as the backend DTO definition doesn't declare them
	const submissions: any[] = (hw as any).submissions || [];

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="blue">{subjectName}</Badge>
					{className && <Badge variant="neutral">{className}</Badge>}
					<span className="ml-auto text-xs text-muted-foreground">
						Краен срок: {formatDate(hw.dateDue)}
					</span>
				</div>
				<CardTitle className="mt-1">{hw.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">{hw.description}</p>
				{hw.resourceLink && (
					<div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground break-all">
						Линк към ресурси:{" "}
						<a
							href={hw.resourceLink}
							target="_blank"
							rel="noreferrer"
							className="underline text-primary"
						>
							{hw.resourceLink}
						</a>
					</div>
				)}
				<div>
					<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Предадени работи ({submissions.length})
					</p>
					{submissions.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Няма предадени работи.
						</p>
					) : (
						<div className="space-y-2">
							{submissions.map((sub: any) => (
								<SubmissionRow
									key={sub.studentId}
									hwId={hw.homeworkId.toString()}
									sub={sub}
									onFeedback={onFeedback}
									users={users}
									classes={classes}
								/>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function SubmissionRow({
	hwId,
	sub,
	onFeedback,
	users,
	classes,
}: {
	hwId: string;
	sub: { studentId: string; fileName: string; feedback?: string };
	onFeedback: (id: string, studentId: string, fb: string) => void;
	users: User[];
	classes: ClassDto[];
}) {
	const student = users.find((u) => u.id === sub.studentId);
	const [fb, setFb] = useState(sub.feedback ?? "");

	const targetClass = classes.find(
		(c) => c.classId === Number(student?.classId),
	);
	const className = targetClass
		? `${targetClass.classGrade}${targetClass.classLetter}`
		: "—";

	return (
		<div className="rounded-xl border border-border bg-muted/30 p-3">
			<div className="flex items-center gap-3">
				<Avatar name={student?.name ?? ""} className="size-8 text-[0.65rem]" />
				<span className="text-sm font-medium">{student?.name}</span>
				<span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-medium text-brand-blue">
					<FileCheck2 className="size-3.5" /> {sub.fileName}
				</span>
			</div>
			<div className="mt-3 rounded-lg border border-border/70 bg-background/70 p-3">
				<div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
					<span>Обратна връзка</span>
					<span>{className}</span>
				</div>
				<div className="flex gap-2">
					<Input
						value={fb}
						onChange={(e) => setFb(e.target.value)}
						placeholder="Обратна връзка / коментар от учителя..."
						className="h-9"
					/>
					<Button
						size="sm"
						className="h-9"
						onClick={() => onFeedback(hwId, sub.studentId, fb)}
					>
						Запиши
					</Button>
				</div>
			</div>
			{sub.feedback && (
				<p className="mt-1.5 text-xs text-success">
					Обратна връзка е изпратена.
				</p>
			)}
		</div>
	);
}

function CreateTaskDialog({
	subjects,
	classId,
	classes,
	onClose,
	onCreate,
}: {
	subjects: SubjectDto[];
	classId: string;
	classes: ClassDto[];
	onClose: () => void;
	onCreate: (data: {
		title: string;
		description: string;
		resourceLink: string;
		subjectId: string;
		dueDate: string;
	}) => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [resourceLink, setResourceLink] = useState("");
	const [subjectId, setSubjectId] = useState("");
	const [dueDate, setDueDate] = useState("");

	useEffect(() => {
		if (subjects.length > 0 && !subjectId) {
			setSubjectId(subjects[0].subjectId.toString());
		}
	}, [subjects, subjectId]);

	const targetClass = classes.find((c) => c.classId === parseInt(classId, 10));
	const className = targetClass
		? `${targetClass.classGrade}${targetClass.classLetter}`
		: "избрания клас";

	return (
		<Dialog
			open
			onClose={onClose}
			title="Добави домашна работа"
			className="max-w-xl"
		>
			<div className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-1.5 block text-sm font-medium">Предмет</label>
						<select
							value={subjectId}
							onChange={(e) => setSubjectId(e.target.value)}
							className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
						>
							<option value="" disabled>
								— Избери предмет —
							</option>
							{subjects.map((s) => (
								<option key={s.subjectId} value={s.subjectId}>
									{s.subjectName}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1.5 block text-sm font-medium">
							Краен срок
						</label>
						<Input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>
				</div>

				<div>
					<label className="mb-1.5 block text-sm font-medium">Заглавие</label>
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Напр. Обикновени дроби — упражнение"
					/>
				</div>

				<div>
					<label className="mb-1.5 block text-sm font-medium">Описание</label>
					<Textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Опиши задачата подробно..."
					/>
				</div>

				<div>
					<label className="mb-1.5 block text-sm font-medium">
						Линк към ресурс
					</label>
					<Input
						value={resourceLink}
						onChange={(e) => setResourceLink(e.target.value)}
						placeholder="https://example.com/resources"
					/>
				</div>

				<div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
					Домашната работа ще бъде добавена за клас {className}.
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={onClose}>
						Връщане назад
					</Button>
					<Button
						onClick={() => {
							onCreate({
								title,
								description,
								resourceLink,
								subjectId,
								dueDate,
							});
						}}
						disabled={!subjectId || !title}
					>
						Добави домашно
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
