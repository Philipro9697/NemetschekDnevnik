import {apiClient} from "./apiClient";
import { UserAccountDto, CreateUserDto } from "./types";

export const userService = {
    getCurrentUser: () => {
        return apiClient<UserAccountDto>("/users/me");
    },

    getAllUsers:() => {
        return apiClient<UserAccountDto[]>("/users");
    },

    getUserProfile:(id: number) => {
        return apiClient<UserAccountDto>(`/users/${id}`);
    },

    createUser:(dto: CreateUserDto) => {
        return apiClient<UserAccountDto>("/users", {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },

    approveUser:(id: number) => {
        return apiClient<UserAccountDto>(`/users/${id}/approve`, {
            method: 'PUT',
        });
    },

    blockUser:(id: number) => {
        return apiClient<UserAccountDto>(`/users/${id}/block`, {
            method: 'PUT',
        });
    },

    deleteUser:(id: number) => {
        return apiClient<{ message: string }>(`/users/${id}`, {
            method: 'DELETE',
        });
    }
};