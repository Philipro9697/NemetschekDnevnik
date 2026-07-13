export type Role = "admin" | "teacher" | "student" | "parent";

export interface SchoolClass {
	id: string;
	name: string;
}

export interface Subject {
	id: string;
	name: string;
	abbr: string;
}

export interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	role: Role;
	status: "active" | "blocked";
	classId?: string; // for students
	className?: string; // real class name from backend, e.g. "5А"
	subjectIds?: string[]; // for teachers
	classTeacherOf?: string; // classId, for class teachers
	childrenIds?: string[]; // for parents
	number?: number; // student number in class
	accessCode?: string; // parent link code
	phone?: string;
	password?: string;
	apiUserId?: number; // real backend user_id, only set for accounts created via the real API
}

export type GradeSection =
	| "term1"
	| "term1Final"
	| "term2"
	| "term2Final"
	| "yearly";

export interface Grade {
	id: string;
	studentId: string;
	subjectId: string;
	teacherId: string;
	value: number; // 2-6
	date: string; // ISO
	time?: string;
	kind: "oral" | "written" | "test" | "active";
	section: GradeSection;
	description?: string;
}

export interface Absence {
	id: string;
	studentId: string;
	subjectId: string;
	teacherId?: string;
	date: string;
	time?: string;
	type: "absent";
	excused: boolean;
}

export interface Note {
	id: string;
	studentId: string;
	subjectId: string;
	teacherId: string;
	date: string;
	time?: string;
	text: string;
	kind: "praise" | "remark";
}

export interface HomeworkSubmission {
	studentId: string;
	fileName: string;
	feedback?: string;
	grade?: number | null;
}

export interface Homework {
	id: string;
	subjectId: string;
	teacherId: string;
	classIds: string[];
	title: string;
	description: string;
	assignedDate: string;
	dueDate: string;
	type: "homework" | "material";
	attachmentName?: string;
	submissions: HomeworkSubmission[];
}

export interface CalendarEvent {
	id: string;
	title: string;
	date: string;
	type: "exam" | "event";
	classIds: string[]; // empty => all classes
	description?: string;
}

export interface ChatMessage {
	id: string;
	senderId: string;
	text: string;
	time: string;
}

export interface Thread {
	id: string;
	name: string;
	participantIds: string[];
	messages: ChatMessage[];
}

export interface Lesson {
	period: number;
	time: string;
	subjectId: string;
	teacherId: string;
	classId: string;
	room: string;
}

/* ---------------- Seed data ---------------- */

export const classes: SchoolClass[] = [
	{ id: "c1a", name: "1.А" },
	{ id: "c2b", name: "2.В" },
	{ id: "c5a", name: "5.А" },
	{ id: "c5b", name: "5.Б" },
	{ id: "c6b", name: "6.Б" },
];

export const subjects: Subject[] = [
	{ id: "mat", name: "Математика", abbr: "МАТ" },
	{ id: "bel", name: "Български език и литература", abbr: "БЕЛ" },
	{ id: "ist", name: "История и цивилизации", abbr: "ИСТ" },
	{ id: "ae", name: "Английски език", abbr: "АЕ" },
	{ id: "chp", name: "Човекът и природата", abbr: "ЧП" },
	{ id: "it", name: "Компютърно моделиране", abbr: "КМ" },
	{ id: "fvs", name: "Физическо възпитание и спорт", abbr: "ФВС" },
];

const studentNames5A = [
	"Александра Петрова",
	"Борис Иванов",
	"Виктория Георгиева",
	"Георги Димитров",
	"Дария Стоянова",
	"Емил Николов",
	"Ивана Тодорова",
	"Калоян Маринов",
	"Мария Ангелова",
	"Никола Колев",
	"Ралица Василева",
	"Симеон Христов",
];

const studentNames2B = [
	"Ава Козлова",
	"Би Нцоло",
	"Виктория Новакова",
	"Георгина Маринова",
	"Дора Левова",
];

export const users: User[] = [
	// Admin
	{
		id: "admin1",
		name: "Елена Секретова",
		username: "e.sekretova",
		email: "sekretariat@ou-vazrazhdane.bg",
		role: "admin",
		status: "active",
	},
	// Teachers
	{
		id: "t1",
		name: "Ирина Георгиева",
		username: "i.georgieva",
		email: "i.georgieva@ou-vazrazhdane.bg",
		role: "teacher",
		status: "active",
		subjectIds: ["mat"],
		classTeacherOf: "c5a",
	},
	{
		id: "t2",
		name: "Петър Иванов",
		username: "p.ivanov",
		email: "p.ivanov@ou-vazrazhdane.bg",
		role: "teacher",
		status: "active",
		subjectIds: ["bel"],
	},
	{
		id: "t3",
		name: "Мария Стефанова",
		username: "m.stefanova",
		email: "m.stefanova@ou-vazrazhdane.bg",
		role: "teacher",
		status: "active",
		subjectIds: ["ae"],
	},
	{
		id: "t4",
		name: "Светлана Петрова",
		username: "s.petrova",
		email: "s.petrova@ou-vazrazhdane.bg",
		role: "teacher",
		status: "active",
		subjectIds: ["mat", "chp"],
		classTeacherOf: "c2b",
	},
	// Students (5.А)
	...studentNames5A.map<User>((name, i) => ({
		id: `s${i + 1}`,
		name,
		username:
			name
				.toLowerCase()
				.replace(/[^a-zа-я ]/gi, "")
				.split(" ")
				.map((p) => p[0])
				.join("") +
			(i + 1),
		email: `student${i + 1}@ou-vazrazhdane.bg`,
		role: "student",
		status: "active",
		classId: "c5a",
		number: i + 1,
		accessCode: `AC-5A-${1000 + i}`,
	})),
	// Students (2.В)
	...studentNames2B.map<User>((name, i) => ({
		id: `s2b${i + 1}`,
		name,
		username:
			name
				.toLowerCase()
				.replace(/[^a-zа-я ]/gi, "")
				.split(" ")
				.map((p) => p[0])
				.join("") +
			(i + 1),
		email: `student2b${i + 1}@ou-vazrazhdane.bg`,
		role: "student",
		status: "active",
		classId: "c2b",
		number: i + 1,
		accessCode: `AC-2B-${2000 + i}`,
	})),
	// Parent linked to two children (Борис Иванов s2 and Мария Ангелова s9)
	{
		id: "p1",
		name: "Иван Иванов",
		username: "iv.ivanov",
		email: "iv.ivanov@gmail.com",
		role: "parent",
		status: "active",
		childrenIds: ["s2", "s9"],
	},
];

export const demoAccounts: {
	username: string;
	role: Role;
	label: string;
	userId: string;
}[] = [
		{
			username: "e.sekretova",
			role: "admin",
			label: "Администратор (Секретар)",
			userId: "admin1",
		},
		{
			username: "i.georgieva",
			role: "teacher",
			label: "Учител / Класен ръководител",
			userId: "t1",
		},
		{
			username: studentUsername(),
			role: "student",
			label: "Ученик (5.А клас)",
			userId: "s2",
		},
		{ username: "iv.ivanov", role: "parent", label: "Родител", userId: "p1" },
	];

function studentUsername() {
	return users.find((u) => u.id === "s2")?.username ?? "student2";
}

/* Today's schedule for 5.А */
export const schedule: Lesson[] = [
	{
		period: 1,
		time: "08:00",
		subjectId: "mat",
		teacherId: "t1",
		classId: "c5a",
		room: "204",
	},
	{
		period: 2,
		time: "08:55",
		subjectId: "bel",
		teacherId: "t2",
		classId: "c5a",
		room: "108",
	},
	{
		period: 3,
		time: "09:50",
		subjectId: "ae",
		teacherId: "t3",
		classId: "c5a",
		room: "301",
	},
	{
		period: 4,
		time: "11:00",
		subjectId: "ist",
		teacherId: "t2",
		classId: "c5a",
		room: "108",
	},
	{
		period: 5,
		time: "11:55",
		subjectId: "chp",
		teacherId: "t3",
		classId: "c5a",
		room: "210",
	},
	{
		period: 6,
		time: "12:50",
		subjectId: "it",
		teacherId: "t1",
		classId: "c5a",
		room: "215",
	},
];

/* Teacher t1 lessons today (across classes) */
export const teacherSchedule: Lesson[] = [
	{
		period: 1,
		time: "08:00",
		subjectId: "mat",
		teacherId: "t1",
		classId: "c5a",
		room: "204",
	},
	{
		period: 2,
		time: "08:55",
		subjectId: "mat",
		teacherId: "t1",
		classId: "c6b",
		room: "204",
	},
	{
		period: 4,
		time: "11:00",
		subjectId: "mat",
		teacherId: "t1",
		classId: "c5b",
		room: "204",
	},
	{
		period: 6,
		time: "12:50",
		subjectId: "it",
		teacherId: "t1",
		classId: "c5a",
		room: "215",
	},
];

function iso(daysAgo: number) {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	return d.toISOString().slice(0, 10);
}

export const seedGrades: Grade[] = [];

export const seedAbsences: Absence[] = [
	{
		id: "a1",
		studentId: "s2",
		subjectId: "ist",
		teacherId: "t2",
		date: iso(6),
		time: "08:00",
		type: "absent",
		excused: true,
	},
	{
		id: "a3",
		studentId: "s9",
		subjectId: "bel",
		teacherId: "t2",
		date: iso(8),
		time: "09:00",
		type: "absent",
		excused: false,
	},
	{
		id: "a4",
		studentId: "s9",
		subjectId: "ae",
		teacherId: "t3",
		date: iso(3),
		time: "11:00",
		type: "absent",
		excused: true,
	},
	{
		id: "a5",
		studentId: "s4",
		subjectId: "mat",
		teacherId: "t1",
		date: iso(2),
		time: "09:00",
		type: "absent",
		excused: false,
	},
];

export const seedNotes: Note[] = [
	{
		id: "n1",
		studentId: "s2",
		subjectId: "mat",
		teacherId: "t1",
		date: iso(1),
		time: "09:55",
		text: "Отлично представяне в час — реши задача на дъската.",
		kind: "praise",
	},
	{
		id: "n2",
		studentId: "s2",
		subjectId: "bel",
		teacherId: "t2",
		date: iso(4),
		time: "10:10",
		text: "Не носи учебник за втори пореден път.",
		kind: "remark",
	},
	{
		id: "n3",
		studentId: "s9",
		subjectId: "ae",
		teacherId: "t3",
		date: iso(2),
		time: "11:30",
		text: "Активно участие и добра работа в група.",
		kind: "praise",
	},
	{
		id: "n4",
		studentId: "s4",
		subjectId: "mat",
		teacherId: "t1",
		date: iso(2),
		time: "09:20",
		text: "Пречи на съучениците по време на час.",
		kind: "remark",
	},
];

export const seedHomework: Homework[] = [
	{
		id: "hw1",
		subjectId: "mat",
		teacherId: "t1",
		classIds: ["c5a"],
		title: "Обикновени дроби — упражнение",
		description:
			"Реши задачи 12–18 от стр. 45 в учебника. Запиши решенията подробно в тетрадката и качи снимка.",
		assignedDate: iso(1),
		dueDate: iso(-2),
		type: "homework",
		submissions: [{ studentId: "s1", fileName: "zadachi_5-18.jpg" }],
	},
	{
		id: "hw2",
		subjectId: "bel",
		teacherId: "t2",
		classIds: ["c5a"],
		title: "Съчинение по картина",
		description:
			'Напиши съчинение (15–20 изречения) по картината „Есен в парка". Обърни внимание на описанието.',
		assignedDate: iso(3),
		dueDate: iso(-4),
		type: "homework",
		submissions: [],
	},
	{
		id: "hw3",
		subjectId: "mat",
		teacherId: "t1",
		classIds: ["c5a", "c6b"],
		title: "Презентация: Питагорова теорема",
		description:
			"Материал за самостоятелна подготовка преди следващия час. Прегледайте слайдовете.",
		assignedDate: iso(2),
		dueDate: iso(-5),
		type: "material",
		submissions: [],
	},
];

export const seedEvents: CalendarEvent[] = [
	{
		id: "e1",
		title: "Контролно по История",
		date: iso(-3),
		type: "exam",
		classIds: ["c5a"],
		description: 'Раздел „Древен Рим".',
	},
	{
		id: "e2",
		title: "Класно по Математика",
		date: iso(-8),
		type: "exam",
		classIds: ["c5a"],
		description: "Дроби и проценти.",
	},
	{
		id: "e3",
		title: "Родителска среща",
		date: iso(-5),
		type: "event",
		classIds: ["c5a"],
		description: "Начало 18:00 ч., стая 204.",
	},
	{
		id: "e4",
		title: "Патронен празник",
		date: iso(-12),
		type: "event",
		classIds: [],
		description: "Общоучилищно събитие.",
	},
	{
		id: "e5",
		title: "Контролно по Английски",
		date: iso(-1),
		type: "exam",
		classIds: ["c5a"],
		description: "Units 1–3.",
	},
];

export const seedThreads: Thread[] = [
	{
		id: "th1",
		name: "Г-жа Георгиева (Класен)",
		participantIds: ["t1", "p1"],
		messages: [
			{
				id: "m1",
				senderId: "t1",
				text: "Здравейте! Напомням за родителската среща в петък от 18:00 ч.",
				time: iso(2) + " 09:12",
			},
			{
				id: "m2",
				senderId: "p1",
				text: "Добър ден, благодаря! Ще присъствам.",
				time: iso(2) + " 10:03",
			},
		],
	},
	{
		id: "th2",
		name: "Група на 5.А клас",
		participantIds: ["t1", "t2", "p1"],
		messages: [
			{
				id: "m3",
				senderId: "t2",
				text: "Резултатите от контролното ще бъдат нанесени до края на седмицата.",
				time: iso(1) + " 14:20",
			},
		],
	},
];

/* ---------------- Helpers ---------------- */

export function subjectById(id: string) {
	return subjects.find((s) => s.id === id)!;
}
export function userById(id: string, all: User[] = users) {
	return all.find((u) => u.id === id);
}
export function classById(id?: string) {
	return classes.find((c) => c.id === id);
}
export function studentsOfClass(classId: string, all: User[] = users) {
	return all
		.filter((u) => u.role === "student" && u.classId === classId)
		.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

export function formatDate(iso: string) {
	const months = [
		"ян",
		"фев",
		"мар",
		"апр",
		"май",
		"юни",
		"юли",
		"авг",
		"сеп",
		"окт",
		"ное",
		"дек",
	];
	const d = new Date(iso);
	return `${d.getDate()} ${months[d.getMonth()]}`;
}
