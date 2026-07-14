import {apiClient} from "./apiClient";
import type { AddGradeDto, GradeDto, UpdateGradeDto } from "./types";

export const gradeService = {
    // POST: api/admin/grades
    addGrade: (dto: AddGradeDto) => {
        return apiClient<GradeDto>("/admin/grades", {
            method: "POST",
            body: JSON.stringify(dto),
        });
    },

    // PUT: api/admin/grades/{id}
    updateGrade: (id: number, dto: UpdateGradeDto) => {
        return apiClient<GradeDto>(`/admin/grades/${id}`, {
            method: "PUT",
            body: JSON.stringify(dto),
        });
    },

    // DELETE: api/admin/grades/{id}
    deleteGrade: (id: number) => {
        return apiClient<void>(`/admin/grades/${id}`, {
            method: "DELETE",
        });
    },
    
    getStudentGrades: (studentId: number) => {
    return apiClient<GradeDto[]>(`/admin/students/${studentId}/grades`, {
        method: "GET",
    });
},
};