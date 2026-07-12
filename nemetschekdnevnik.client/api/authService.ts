import { apiClient } from './apiClient';
import { LoginDto, RegisterDto } from './types';

function setStoredValue(key: string, value: string | null) {
    if (typeof window === 'undefined') return;
    if (value === null) {
        window.localStorage.removeItem(key);
        return;
    }
    window.localStorage.setItem(key, value);
}

export interface AuthResponse {
    token: string | { accessToken: string; userId: number; role: string };
    userId: number;
    role: string;
}

export const authService = {
    login: async (dto: LoginDto) => {
        setStoredValue('authSessionRevoked', null);
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
        try {
            return await apiClient<{ message: string }>('/auth/logout', {
                method: 'POST',
            });
        } finally {
            setStoredValue('accessToken', null);
            setStoredValue('authSessionRevoked', '1');
        }
    },

    register: async (dto: RegisterDto) => {
        return await apiClient<{ message: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    }
};