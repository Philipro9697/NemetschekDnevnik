"use client";
import { userService } from "@/api/userService";
import { adminService } from "@/api/adminService";
import { gradeService } from "@/api/gradeService";
import type {
  UserRole,
  UserAccountDto,
  GradeDto,
  StudentInfoDto,
  ClassDto,
} from "@/api/types";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { classes, classById, subjects, type Role, type User } from "@/lib/data";
import {
  UserPlus,
  Pencil,
  Ban,
  Trash2,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  BookOpen,
} from "lucide-react";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Администратор",
  teacher: "Учител",
  student: "Ученик",
  parent: "Родител",
};

const ROLE_TONE: Record<Role, "primary" | "accent" | "success" | "warning"> = {
  admin: "warning",
  teacher: "primary",
  student: "accent",
  parent: "success",
};

const BACKEND_CLASS_MAP: Record<string, number> = {
  c5a: 1,
  c5b: 2,
  c6b: 3,
};

function transliterate(name: string) {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sht",
    ъ: "a",
    ь: "y",
    ю: "yu",
    я: "ya",
  };
  return name
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

// The API's role strings ("Teacher", "Student", "Parent", possibly "Admin") don't
// match the lowercase Role type used throughout this page's UI — normalize here.
function toLocalRole(role: string): Role {
  const normalized = role.toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "teacher" ||
    normalized === "student" ||
    normalized === "parent"
  ) {
    return normalized as Role;
  }
  return "student";
}

// UserAccountDto has no username field, but User requires one. Real accounts are
// created (in RegisterDialog) with username = the email's local part, so reuse that
// convention here; fall back to a transliterated name if the email is ever malformed.
function usernameFromEmail(email: string, fallbackName: string): string {
  const [localPart] = email.split("@");
  if (localPart) return localPart;
  return transliterate(fallbackName).replace(/\s+/g, ".");
}

// UserAccountDto has no direct "blocked" flag — isApproved is the closest proxy
// available. This assumes an unapproved account should read as "blocked" in this
// table; confirm that matches your backend's intended semantics.
function toDisplayUserFromDto(dto: UserAccountDto): User {
  const name =
    [dto.firstName, dto.lastName].filter(Boolean).join(" ").trim() || dto.email;

  return {
    id: `user-${dto.userId}`,
    apiUserId: dto.userId,
    name,
    username: usernameFromEmail(dto.email, name),
    email: dto.email,
    phone: dto.phoneNumber,
    role: toLocalRole(dto.role),
    status: dto.isApproved ? "active" : "blocked",
  } as User;
}

export function AdminUsers() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState<User | null>(null);
  const [detailCandidate, setDetailCandidate] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [classFilter, setClassFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "blocked"
  >("all");
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  const [realStudents, setRealStudents] = useState<StudentInfoDto[]>([]);
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [realClasses, setRealClasses] = useState<ClassDto[]>([]);
  const [deletingUser, setDeletingUser] = useState(false);
  const [openDeleteGrades, setOpenDeleteGrades] = useState(false);

  useEffect(() => {
    // Note: Change 'adminService' to 'userService' if your getClasses method lives there
    adminService
      .getClasses()
      .then((data) => {
        console.log("Classes loaded successfully:", data);
        setRealClasses(data);
      })
      .catch((error) => {
        console.error("Failed to fetch real classes from the server:", error);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingUsers(true);

    userService
      .getAllUsers()
      .then((data) => {
        if (cancelled) return;
        setDbUsers(data.map(toDisplayUserFromDto));
        setUsersError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        if (!cancelled) {
          setUsersError("Неуспешно зареждане на потребителите от сървъра.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Real backend users take priority. Anything in app.users without a matching
  // apiUserId (e.g. seed/demo rows, or something added locally this session that
  // hasn't been refetched yet) is kept alongside them rather than dropped.
  const allUsers = useMemo(() => {
    return [...dbUsers];
  }, [dbUsers]);

  useEffect(() => {
    adminService
      .getStudents()
      .then(setRealStudents)
      .catch((error) => console.error("Failed to fetch real students:", error));
  }, []);

  // Real backend-backed accounts (apiUserId set) get their real class letter from
  // the server; purely mock/demo student rows keep the mock lib/data lookup.
  const realClassByStudentId = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of realStudents) {
      if (s.classGrade) map.set(s.studentId, `${s.classGrade}${s.classLetter}`);
    }
    return map;
  }, [realStudents]);

  // Replace your old classLabelFor function with this database-driven one
  function classLabelFor(u: User) {
    if (u.role === "student" && u.apiUserId) {
      return realClassByStudentId.get(u.apiUserId) ?? "—";
    }
    const foundClass = realClasses.find(
      (c) => c.classId.toString() == u.classId,
    );
    return foundClass
      ? `${foundClass.classGrade}${foundClass.classLetter}`
      : "—";
  }

  const filtered = useMemo(() => {
    const queryText = query.toLowerCase().trim();
    return allUsers.filter((u) => {
      const className =
        classLabelFor(u) !== "—"
          ? classLabelFor(u)
          : u.classTeacherOf
            ? classById(u.classTeacherOf)?.name + " (кл.)"
            : "";
      const statusLabel = u.status === "active" ? "активен" : "блокиран";
      const searchText = [
        u.name,
        u.email,
        className,
        statusLabel,
        ROLE_LABEL[u.role],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !queryText || searchText.includes(queryText);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesClass =
        classFilter === "all" ||
        u.classId === classFilter ||
        u.classTeacherOf === classFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesQuery && matchesRole && matchesClass && matchesStatus;
    });
  }, [
    allUsers,
    query,
    roleFilter,
    classFilter,
    statusFilter,
    realClassByStudentId,
  ]);

  const counts = {
    all: allUsers.length,
    teacher: allUsers.filter((u) => u.role === "teacher").length,
    student: allUsers.filter((u) => u.role === "student").length,
    parent: allUsers.filter((u) => u.role === "parent").length,
  };

  async function handleDeleteConfirm() {
    if (!deleteCandidate) return;

    setDeletingUser(true);
    try {
      // 1. If it's a real backend account, delete it from the SQL database first
      if (deleteCandidate.apiUserId) {
        await userService.deleteUser(deleteCandidate.apiUserId);
        // Note: If your delete method lives inside adminService instead,
        // swap this to: await adminService.deleteUser(deleteCandidate.apiUserId);
      }

      // 2. Remove it from your local frontend context state array
      app.deleteUser(deleteCandidate.id);

      // 3. Clean up dialog state
      setDeleteCandidate(null);
    } catch (err: any) {
      console.error("Failed to delete user from server:", err);
      alert("Възникна грешка при изтриването на потребителя от сървъра.");
    } finally {
      setLoadingUsers(false);
      setDeletingUser(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-brand-blue/10 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="size-3.5" /> Администрация
            </div>
            <h2 className="font-heading text-xl font-bold">
              Управление на потребители
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Създавайте профили, следите активността и управлявайте ролите в
              училището.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-border bg-card/80 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Общо потребители</p>
              <p className="font-heading text-lg font-semibold">{counts.all}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Активни</p>
              <p className="font-heading text-lg font-semibold text-success">
                {allUsers.filter((u) => u.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Търси по име, клас или статус..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-primary"
          >
            <option value="all">Всички класове</option>
            {realClasses.map((klass) => (
              <option key={klass.classId} value={klass.classId.toString()}>
                {klass.classGrade}
                {klass.classLetter}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "blocked")
            }
            className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-primary"
          >
            <option value="all">Всички статуси</option>
            <option value="active">Активни</option>
            <option value="blocked">Блокирани</option>
          </select>
          <Button onClick={() => setOpen(true)} className="shrink-0">
            <UserPlus className="size-4" /> Регистрирай нов потребител
          </Button>
          <Button
            variant="destructive"
            onClick={() => setOpenDeleteGrades(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="size-4" />
            Изтриване на оценки
          </Button>
        </div>
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", `Всички (${counts.all})`],
            ["teacher", `Учители (${counts.teacher})`],
            ["student", `Ученици (${counts.student})`],
            ["parent", `Родители (${counts.parent})`],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setRoleFilter(val as Role | "all")}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (roleFilter === val
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Име</th>
                <th className="px-4 py-3 font-semibold">Роля</th>
                <th className="px-4 py-3 font-semibold">Клас / Предмет</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
                <th className="px-4 py-3 text-right font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} className="size-9" />
                      <div className="min-w-0">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.role === "student"
                      ? classLabelFor(u)
                      : u.role === "teacher"
                        ? `${u.classTeacherOf ? classById(u.classTeacherOf)?.name + " (кл.)" : "—"}${
                            u.subjectIds?.length
                              ? ` • ${u.subjectIds
                                  .map(
                                    (id) =>
                                      subjects.find((s) => s.id === id)?.name,
                                  )
                                  .filter(Boolean)
                                  .join(", ")}`
                              : ""
                          }`
                        : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex items-center gap-1.5 text-sm font-medium " +
                        (u.status === "active" ? "text-success" : "text-danger")
                      }
                    >
                      <span
                        className={
                          "size-1.5 rounded-full " +
                          (u.status === "active" ? "bg-success" : "bg-danger")
                        }
                      />
                      {u.status === "active" ? "Активен" : "Блокиран"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        label="Редакция"
                        onClick={() => setEditCandidate(u)}
                      >
                        <Pencil className="size-4" />
                      </IconBtn>
                      <IconBtn
                        label="Изтрий"
                        onClick={() => setDeleteCandidate(u)}
                        tone="danger"
                        disabled={u.role === "admin"}
                      >
                        <Trash2 className="size-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {loadingUsers && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Зареждане на потребители…
                  </td>
                </tr>
              )}
              {!loadingUsers && usersError && dbUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-center text-sm text-danger"
                  >
                    {usersError} Показани са само локални/демо данни.
                  </td>
                </tr>
              )}
              {filtered.length === 0 && !loadingUsers && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Няма намерени потребители.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RegisterDialog
        open={open}
        onClose={() => setOpen(false)}
        realClasses={realClasses}
      />
      <EditUserDialog
        open={Boolean(editCandidate)}
        user={editCandidate}
        realClasses={realClasses}
        realStudents={realStudents}
        onClose={() => setEditCandidate(null)}
        onSave={(updates) => {
          if (editCandidate) {
            app.updateUser(editCandidate.id, updates);
          }
          setEditCandidate(null);
        }}
      />
      <DeleteGradeDialog
        open={openDeleteGrades}
        onClose={() => setOpenDeleteGrades(false)}
        realClasses={realClasses}
        realStudents={realStudents}
      />

      <Dialog
        // Prevent the modal from being closed accidentally while an API operation is running
        open={Boolean(deleteCandidate)}
        onClose={() => !deletingUser && setDeleteCandidate(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Потвърждение за изтриване</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Сигурни ли сте, че искате да изтриете потребителя{" "}
              <span className="font-semibold text-foreground">
                {deleteCandidate?.name}
              </span>
              ? Действието е необратимо.
            </p>
          </div>
          <DialogFooter className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCandidate(null)}
              disabled={deletingUser}
            >
              Не, откажи
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingUser}
            >
              {deletingUser ? "Изтриване..." : "Да, сигурен съм"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  tone = "muted",
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone?: "muted" | "danger" | "warning" | "success";
  disabled?: boolean;
}) {
  const toneMap = {
    muted: "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger: "text-muted-foreground hover:bg-danger/10 hover:text-danger",
    warning:
      "text-muted-foreground hover:bg-warning/15 hover:text-warning-foreground",
    success: "text-muted-foreground hover:bg-success/10 hover:text-success",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        "rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-30 " +
        toneMap[tone]
      }
    >
      {children}
    </button>
  );
}

function RegisterDialog({
  open,
  onClose,
  realClasses,
}: {
  open: boolean;
  onClose: () => void;
  realClasses: ClassDto[];
}) {
  const app = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [classId, setClassId] = useState<string>("");
  const [teacherSubjectId, setTeacherSubjectId] = useState<string>(
    subjects[0]?.id ?? "",
  );
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Track loading and error states for the API request
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Updated to include the generated password(s) for the admin to copy
  const [created, setCreated] = useState<{
    username: string;
    password?: string;
    parentUsername?: string;
    parentPassword?: string;
  } | null>(null);

  const backendClassIdByClientId: Record<string, number> = {
    c5a: 1,
    c5b: 2,
    c6b: 3,
  };

  useEffect(() => {
    if (realClasses.length > 0 && !classId) {
      setClassId(realClasses[0].classId.toString());
    }
  }, [realClasses]);

  const username = name.trim() ? transliterate(name).replace(/\s+/g, ".") : "";
  const parentUsername = parentName.trim()
    ? transliterate(parentName).replace(/\s+/g, ".")
    : "";

  function reset() {
    setName("");
    setEmail("");
    setRole("student");
    setClassId(realClasses[0]?.classId.toString() ?? "");
    setCreated(null);
    setError(null);
    setLoading(false);
  }

  async function handleSubmit() {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Петров";

    const parentNameParts = parentName.trim().split(/\s+/);
    const parentFirstName = parentNameParts[0] || "";
    const parentLastName =
      parentNameParts.length > 1
        ? parentNameParts.slice(1).join(" ")
        : "Петрова";

    const generatedPassword =
      "Nms" + Math.floor(100000 + Math.random() * 899000) + "!";
    const parentPassword =
      "Nms" + Math.floor(100000 + Math.random() * 899000) + "!";

    const backendRole: UserRole =
      role === "teacher"
        ? "Teacher"
        : role === "student"
          ? "Student"
          : "Parent";

    const targetEmail = email.trim() || `${username}@ou-vazrazhdane.bg`;

    try {
      const secondaryUser =
        role === "student"
          ? await userService.createUser({
              email:
                parentEmail.trim() || `${parentUsername}@ou-vazrazhdane.bg`,
              password: parentPassword,
              role: "Parent",
              firstName: parentFirstName,
              lastName: parentLastName,
              phoneNumber: parentPhone.trim(),
            })
          : undefined;

      const studentClassId = classId ? Number(classId) : undefined;

      const serverUser = await userService.createUser({
        email: targetEmail,
        password: generatedPassword,
        role: backendRole,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber.trim(),
        parentId:
          role === "student" && secondaryUser
            ? secondaryUser.userId
            : undefined,
        classId: role === "student" ? studentClassId : undefined,
      });

      if (app.addUser) {
        app.addUser({
          name: `${serverUser.firstName} ${serverUser.lastName}`,
          username: username,
          email: serverUser.email,
          role: role,
          status: serverUser.isApproved ? "active" : "blocked",
          apiUserId: serverUser.userId,
          ...(role === "student" ? { classId } : {}),
        });
      }

      if (role === "student" && app.addUser && secondaryUser) {
        const parentUsername = parentName.trim()
          ? transliterate(parentName).replace(/\s+/g, ".")
          : "";

        app.addUser({
          name: `${secondaryUser.firstName} ${secondaryUser.lastName}`,
          username: parentUsername,
          email: secondaryUser.email,
          role: "parent",
          status: secondaryUser.isApproved ? "active" : "blocked",
        });
      }

      setCreated({
        username,
        password: generatedPassword,
        parentUsername: role === "student" ? parentUsername : undefined,
        parentPassword: role === "student" ? parentPassword : undefined,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Възникна грешка при комуникацията със сървъра.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="max-w-lg">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-success" />
                Профилът е създаден
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Потребителско име
                </p>
                <p className="font-mono text-lg font-semibold">
                  {created.username}
                </p>
                {created.password && (
                  <>
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                      Парола
                    </p>
                    <p className="font-mono text-lg font-semibold">
                      {created.password}
                    </p>
                  </>
                )}
              </div>
              {created.parentUsername && (
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Потребителско име на родителя
                  </p>
                  <p className="font-mono text-lg font-semibold">
                    {created.parentUsername}
                  </p>
                  {created.parentPassword && (
                    <>
                      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                        Парола на родителя
                      </p>
                      <p className="font-mono text-lg font-semibold">
                        {created.parentPassword}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>
                Създай още един
              </Button>
              <Button onClick={handleClose}>Готово</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-10 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <ShieldCheck className="size-5 text-primary" />
                Регистрация на нов потребител
              </DialogTitle>
            </DialogHeader>
            <div>
              <div className="flex items-center gap-2 font-medium text-foreground"></div>
            </div>
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Роля</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="teacher">Учител</option>
                    <option value="student">Ученик</option>
                  </select>
                </div>
                {role === "student" && (
                  <div className="space-y-1.5">
                    <Label>Клас</Label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {realClasses.map((c) => (
                        <option key={c.classId} value={c.classId}>
                          {c.classGrade}
                          {c.classLetter}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {role === "teacher" && (
                  <div className="space-y-1.5">
                    <Label>Предмет</Label>
                    <select
                      value={teacherSubjectId}
                      onChange={(e) => setTeacherSubjectId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Три имена</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="напр. Георги Иванов Петров"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Имейл</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="напр. g.petrov@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="напр. +359 87 123 4567"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Паролата се генерира автоматично и се показва след създаването
                на профила.
              </p>
              {role === "student" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Три имена на родителя</Label>
                    <Input
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="напр. Мария Иванова Петрова"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Имейл на родителя</Label>
                      <Input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="имейл на родителя"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Телефон на родителя</Label>
                      <Input
                        type="tel"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="напр. +359 88 765 4321"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Отказ
              </Button>
              <Button onClick={handleSubmit} disabled={!name.trim()}>
                Създай профил
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  open,
  user,
  realClasses,
  realStudents, // <-- Accept it here
  onClose,
  onSave,
}: {
  open: boolean;
  user: User | null;
  realClasses: ClassDto[];
  realStudents: StudentInfoDto[]; // <-- Define type here
  onClose: () => void;
  onSave: (updates: Partial<Omit<User, "id">>) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [classId, setClassId] = useState<string>("");
  const [classTeacherOf, setClassTeacherOf] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setClassId(
      user.classId?.toString() ?? realClasses[0]?.classId.toString() ?? "",
    );
    setClassTeacherOf(user.classTeacherOf ?? "");
    setSubjectId(user.subjectIds?.[0] ?? subjects[0]?.id ?? "");
    setPhone(user.phone ?? "");
    setPassword("");
    setError(null);
    setLoading(false);
    // 1. If it's a student, find their matching real backend class ID record
    if (user.role === "student" && user.apiUserId) {
      const matchingStudent = realStudents.find(
        (s) => s.studentId === user.apiUserId,
      );
      if (matchingStudent) {
        // Find the class entity that matches the student's grade and letter strings
        const matchedClass = realClasses.find(
          (c) =>
            c.classGrade === matchingStudent.classGrade &&
            c.classLetter === matchingStudent.classLetter,
        );
        setClassId(
          matchedClass?.classId.toString() ??
            realClasses[0]?.classId.toString() ??
            "",
        );
      } else {
        setClassId(realClasses[0]?.classId.toString() ?? "");
      }
    } else {
      setClassId(realClasses[0]?.classId.toString() ?? "");
    }

    // 2. Fallback configuration for teachers
    setClassTeacherOf(user.classTeacherOf ?? "");
    setSubjectId(user.subjectIds?.[0] ?? subjects[0]?.id ?? "");
  }, [user, realClasses, realStudents]);

  async function handleSave() {
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // 1. Properly map UI role strings to backend-friendly pascal case strings
    const backendRole: UserRole =
      role === "teacher"
        ? "Teacher"
        : role === "student"
          ? "Student"
          : "Parent";

    const studentClassId =
      role === "student" && classId ? Number(classId) : undefined;
    const teacherClassId =
      role === "teacher" && classTeacherOf ? Number(classTeacherOf) : undefined;
    const backendSubjectId =
      role === "teacher" && subjectId ? Number(subjectId) : undefined;

    try {
      if (user?.apiUserId) {
        // 2. Fire the API update call to save to SQL Database
        await userService.updateUser(user.apiUserId, {
          firstName,
          lastName,
          email: email.trim(),
          phoneNumber: phone.trim(),
          isApproved: true,
          role: backendRole,
          password: password.trim() ? password.trim() : undefined,
          classId: studentClassId,
          classTeacherOfId: teacherClassId,
          subjectIds: backendSubjectId ? [backendSubjectId] : [],
        });
      }

      // 3. Build updates dictionary using strict, matching local Role types
      const updates: Partial<Omit<User, "id">> = {
        name: name.trim(),
        email: email.trim(),
        role: role as Role, // Explicitly cast to the local UI Role type
        phone: phone.trim(),
      };

      if (role === "student") {
        updates.classId = classId;
        updates.classTeacherOf = undefined;
        updates.subjectIds = undefined;
      } else if (role === "teacher") {
        updates.classTeacherOf = classTeacherOf || undefined;
        updates.subjectIds = subjectId ? [subjectId] : [];
        updates.classId = undefined;
      } else {
        updates.classId = undefined;
        updates.classTeacherOf = undefined;
        updates.subjectIds = undefined;
      }

      // 4. Force synchronization back to your global useApp context so the table changes instantly
      onSave(updates);
      onClose();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err.message || "Възникна грешка при запазване на промените.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Редакция на акаунт</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-danger/10 text-danger border border-danger/20">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Роля</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
            >
              <option value="student">Ученик</option>
              <option value="teacher">Учител</option>
              <option value="parent">Родител</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Три имена</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Имейл</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Нова Парола (оставете празно ако не променяте)</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
              />
            </div>
          </div>

          {role === "student" && (
            <div className="space-y-1.5">
              <Label>Клас</Label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={loading}
              >
                {realClasses.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.classGrade}
                    {c.classLetter}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отказ
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading ? "Запазване..." : "Запази промени"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGradeDialog({
  open,
  onClose,
  realClasses,
  realStudents,
}: {
  open: boolean;
  onClose: () => void;
  realClasses: ClassDto[];
  realStudents: StudentInfoDto[];
}) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [studentGrades, setStudentGrades] = useState<GradeDto[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Filter students based on the selected class dropdown
  const filteredStudents = realStudents.filter(
    (s) => s.classId === selectedClassId,
  );

  // 2. Load grades from backend whenever a student is selected
  useEffect(() => {
    if (!selectedStudentId) {
      setStudentGrades([]);
      setSelectedGradeId(null);
      return;
    }

    setLoadingGrades(true);
    setError(null);
    setSelectedGradeId(null);

    gradeService
      .getStudentGrades(selectedStudentId)
      .then((data) => {
        setStudentGrades(data || []);
      })
      .catch((err: any) => {
        console.error("Failed to load student grades:", err);
        setError("Не успяхме да заредим оценките за този ученик.");
      })
      .finally(() => setLoadingGrades(false));
  }, [selectedStudentId]);

  // 3. Reset all state cleanly when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedClassId(null);
      setSelectedStudentId(null);
      setStudentGrades([]);
      setSelectedGradeId(null);
      setError(null);
    }
  }, [open]);

  async function handleDeleteGrade() {
    if (!selectedGradeId) return;

    setDeleting(true);
    setError(null);
    try {
      await gradeService.deleteGrade(selectedGradeId);
      // Remove the deleted grade from the list immediately
      setStudentGrades((prev) =>
        prev.filter((g) => g.gradeId !== selectedGradeId),
      );
      setSelectedGradeId(null);
    } catch (err: any) {
      console.error("Failed to delete grade:", err);
      setError(err.message || "Грешка при изтриване на оценката.");
    } finally {
      setDeleting(false);
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-4xl border-danger/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <Trash2 className="size-5" />
            Изтриване на оценка
          </DialogTitle>
        </DialogHeader>

        {/* Side-by-Side Layout */}
        <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-12">
          {/* LEFT COLUMN: Class & Student Selection (Red/Destructive Theme) */}
          <div className="space-y-4 rounded-xl border border-danger/30 bg-danger/5 p-4 md:col-span-5">
            {/* Class / Grade Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Клас / Паралелка
              </Label>
              <select
                value={selectedClassId ?? ""}
                onChange={(e) => {
                  setSelectedClassId(Number(e.target.value) || null);
                  setSelectedStudentId(null); // Reset student selection
                }}
                className="h-10 w-full rounded-lg border border-danger/20 bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-danger"
              >
                <option value="">-</option>
                {realClasses.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.classGrade} "{c.classLetter}" клас
                  </option>
                ))}
              </select>
            </div>

            {/* Student Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Ученик в класа
              </Label>
              <select
                value={selectedStudentId ?? ""}
                disabled={!selectedClassId || filteredStudents.length === 0}
                onChange={(e) =>
                  setSelectedStudentId(Number(e.target.value) || null)
                }
                className="h-10 w-full rounded-lg border border-danger/20 bg-card px-3 text-sm outline-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-danger"
              >
                <option value="">-</option>
                {filteredStudents.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.firstName} {s.lastName} ({s.email})
                  </option>
                ))}
              </select>
              {selectedClassId && filteredStudents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Няма намерени ученици в този клас.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Grade List & Deletion */}
          <div className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-card p-4 md:col-span-7">
            <div>
              {error && (
                <div className="mb-3 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              {loadingGrades ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Зареждане на оценките...
                </div>
              ) : !selectedStudentId ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Моля, изберете клас и ученик от лявата втора, за да видите
                  оценките му.
                </div>
              ) : studentGrades.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Този ученик няма записани оценки.
                </div>
              ) : (
                /* Interactive Clickable List of Grades */
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {studentGrades.map((grade) => {
                    const isSelected = selectedGradeId === grade.gradeId;
                    return (
                      <div
                        key={grade.gradeId}
                        onClick={() => setSelectedGradeId(grade.gradeId)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                          isSelected
                            ? "border-danger bg-danger/15 shadow-sm ring-1 ring-danger"
                            : "border-border bg-muted/20 hover:border-danger/40 hover:bg-muted/40"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="text-base font-bold text-foreground">
                              {grade.gradeValue}
                            </span>
                            <span className="text-sm text-foreground">
                              {grade.subjectName}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Учител: {grade.teacherFirstName}{" "}
                            {grade.teacherLastName} • {grade.entryDate}
                          </div>
                          {grade.comment && (
                            <div className="text-xs italic text-muted-foreground">
                              "{grade.comment}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Destructive Action Button at bottom of right panel */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="destructive"
                className="w-full font-semibold shadow-sm"
                disabled={!selectedGradeId || deleting}
                onClick={handleDeleteGrade}
              >
                {deleting
                  ? "Изтриване..."
                  : "Изтрий"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Затвори
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
