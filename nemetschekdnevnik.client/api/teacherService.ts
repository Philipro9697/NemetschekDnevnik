import { apiClient } from "./apiClient";
import{
    GradeDto,
    ScheduleDto,
    AbsenceDto,
    RemarkDto,
    LessonDto,
    TeacherInfoDto,
    SubjectDto,
    HomeworkItemDto,
} from "./types";

export const teacherService = {
    getGrades: () => {
        return apiClient<GradeDto[]>("/teacher/class/grades");
    },

    getSchedule: () => {
        return apiClient<ScheduleDto[]>("/teacher/schedule");
    },

    getAbsences: () => {
        return apiClient<AbsenceDto[]>("/teacher/absences");
    },

    getRemarks: () => {
        return apiClient<RemarkDto[]>("/teacher/remarks");
    },

    getLessons: () => {
        return apiClient<LessonDto[]>("/teacher/lessons");
    },

    getTeacherInfo: () => {
        return apiClient<TeacherInfoDto>("/teacher/teacher_info");
    },

    getSubjects: () => {
        return apiClient<SubjectDto[]>("/teacher/subjects");
    },

    getHomework: () => {
        return apiClient<HomeworkItemDto[]>("/teacher/homework");
    }
};