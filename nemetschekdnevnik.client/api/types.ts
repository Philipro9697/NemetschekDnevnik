export type UserRole = 'Teacher' | 'Student' | 'Parent';

export interface AbsenceDto {
    isExcused: boolean;
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:mm:ss"
    subjectId: number;
    subjectName: string;
    lessonId: number;
}

export interface CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface GradeDto {
    gradeValue: number;
    subjectId: number;
    teacherId: number;
    subjectName: string;
    teacherFirstName: string;
    teacherLastName: string;
    gradeTypeName: string;
    comment?: string | null;
    entryDate: string;
}

export interface HomeworkItemDto {
    homeworkId: number;
    subjectId: number;
    teacherId: number;
    title: string;
    description: string;
    resourceLink: string;
    dateAssigned: string;
    dateDue: string;
}

export interface LessonDto {
    date: string;
    time: string;
    subjectId: number;
    teacherId: number;
    teacherFirstName: string;
    teacherLastName: string;
    subjectName: string;
    scheduleItemId: number;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface RemarkDto {
    teacherId: number;
    dateCreated: string;
    type: string;
    text: string;
    teacherFirstName: string;
    teacherLastName: string;
}

export interface ScheduleDto {
    dayOfWeek: number;
    time: string;
    subjectId: number;
    teacherId: number;
    teacherFirstName: string;
    teacherLastName: string;
    subjectName: string;
    location?: string | null;
}

export interface SubjectDto {
    subjectId: number;
    subjectName: string;
}

export interface UserAccountDto {
    userId: number;
    email: string;
    role: UserRole | string;
    isApproved: boolean;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export interface StudentInfoDto {
    studentId: number;
    parentId: number;
    classId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

export interface TeacherInfoDto {
    teacherId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}