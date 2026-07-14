import { apiClient } from "./apiClient";
import { AddGradeDto, GradeDto, StudentInfoDto, ClassDto, SubjectDto } from "./types";

export const adminService = {

    getSubjects: () => {
        return apiClient<SubjectDto[]>("/admin/subjects", {
            method: "GET",
        });
    },

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
