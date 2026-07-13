import { apiClient } from "./apiClient";
import{
    GradeDto,
    AddGradeDto,
    ClassDto,
    ScheduleDto,
    AbsenceDto,
    RemarkDto,
    LessonDto,
    SubjectDto,
    HomeworkItemDto,
    StudentInfoDto,
} from "./types";

export const teacherService = {
    getGrades: (classId: number) => {
        return apiClient<GradeDto[]>(`/teacher/grades/${classId}`);
    },

    addGrade: (dto: AddGradeDto) => {
        return apiClient<GradeDto>("/teacher/grades", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    },

    getClasses: () => {
        return apiClient<ClassDto[]>("/teacher/classes");
    },

    getClass: () => {
        return apiClient<ClassDto | null>("/teacher/class");
    },

    getStudents: (classId: number) => {
        return apiClient<StudentInfoDto[]>(`/teacher/students/${classId}`);
    },

    getSchedule: () => {
        return apiClient<ScheduleDto[]>("/teacher/schedule");
    },

    getAbsences: (classId: number) => {
        return apiClient<AbsenceDto[]>(`/teacher/absences/${classId}`);
    },

    getRemarks: (classId: number) => {
        return apiClient<RemarkDto[]>(`/teacher/remarks/${classId}`);
    },

    getRemarksForStudent: (studentId: number) => {
        return apiClient<RemarkDto[]>(`/teacher/remarks/student/${studentId}`);
    },

    getLessons: (classId: number) => {
        return apiClient<LessonDto[]>(`/teacher/lessons/${classId}`);
    },

    getSubjects: () => {
        return apiClient<SubjectDto[]>("/teacher/subjects");
    },

    getHomework: (classId: number) => {
        return apiClient<HomeworkItemDto[]>(`/teacher/homework/${classId}`);
    }
};