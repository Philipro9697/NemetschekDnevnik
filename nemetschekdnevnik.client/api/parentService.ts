import { apiClient } from "./apiClient";
import {
    StudentInfoDto,
    GradeDto,
    AbsenceDto,
    RemarkDto,
    SubjectDto,
} from "./types";

export const parentService = {
    getChildren: () => {
        return apiClient<StudentInfoDto[]>("/parent/children");
    },

    getChildGrades: (studentId: number) => {
        return apiClient<GradeDto[]>(`/parent/grades/${studentId}`);
    },

    getChildAbsences: (studentId: number) => {
        return apiClient<AbsenceDto[]>(`/parent/absences/${studentId}`);
    },

    getChildRemarks: (studentId: number) => {
        return apiClient<RemarkDto[]>(`/parent/remarks/${studentId}`);
    },

    getChildSubjects: (studentId: number) => {
        return apiClient<SubjectDto[]>(`/parent/subjects/${studentId}`);
    },
};
