import { apiClient } from "./apiClient";
import { AddGradeDto, GradeDto, StudentInfoDto, ClassDto } from "./types";

export const adminService = {
    getStudents: () => {
        return apiClient<StudentInfoDto[]>("/users/students");
    },
    
    getClasses: () => {
        // NOTE: Adjust the endpoint string (""/admin/classes"", ""/users/classes"", or ""/classes"")
        // to match the exact Route attribute defined on your C# Classes Controller.
        return apiClient<ClassDto[]>("/admin/classes"); 
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
