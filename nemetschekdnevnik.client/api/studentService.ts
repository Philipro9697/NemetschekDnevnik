import { apiClient } from "./apiClient";
import{
    GradeDto,
    ScheduleDto,
    AbsenceDto,
    RemarkDto,
    LessonDto,
    StudentInfoDto,
    SubjectDto,
    HomeworkItemDto,
} from "./types";

export const studentService = {
    getGrades: () => {
        return apiClient<GradeDto[]>("/student/grades");
    },

    getSchedule: () => {
        return apiClient<ScheduleDto[]>("/student/schedule");
    },

    getAbsences: () => {
        return apiClient<AbsenceDto[]>("/student/absences");
    },

    getRemarks: () => {
        return apiClient<RemarkDto[]>("/student/remarks");
    },

    getLessons: () => {
        return apiClient<LessonDto[]>("/student/lessons");
    },

    getStudentInfo: () => {
        return apiClient<StudentInfoDto>("/student/student_info");
    },

    getSubjects: () => {
        return apiClient<SubjectDto[]>("/student/subjects");
    },

    getHomework: () => {
        return apiClient<HomeworkItemDto[]>("/student/homework");
    }
};