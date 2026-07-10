import { apiClient } from './apiClient';
import { LoginDto, RegisterDto } from './types';

export interface AuthResponse {
    token: {
        accessToken: string;
        userId: number;
        role: string;
    };
}

export const authService = {
    login: async (dto: LoginDto) => {
        const response = await apiClient<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
        return response;
    },

    refresh: async () => {
        return await apiClient<{ token: string }>('/auth/refresh', {
            method: 'POST',
        });
    },

    logout: async () => {
        return await apiClient<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
    },

    register: async (dto: RegisterDto) => {
        return await apiClient<{ message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    }
};