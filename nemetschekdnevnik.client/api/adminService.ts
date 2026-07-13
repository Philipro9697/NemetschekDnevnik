import { apiClient } from "./apiClient";
import { AddGradeDto, GradeDto, StudentInfoDto } from "./types";

export const adminService = {
    getStudents: () => {
        return apiClient<StudentInfoDto[]>("/users/students");
    },

    addGrade: (dto: AddGradeDto) => {
        return apiClient<GradeDto>("/admin/grades", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    },

    deleteGrade: (gradeId: number) => {
        return apiClient<void>(`/admin/grades/${gradeId}`, {
            method: "DELETE",
        });
    },
};
