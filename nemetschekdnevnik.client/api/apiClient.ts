const BASE_URL = 'http://localhost:5014/api';

function getStoredValue(key: string) {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
}

function setStoredValue(key: string, value: string | null) {
    if (typeof window === 'undefined') return;
    if (value === null) {
        window.localStorage.removeItem(key);
        return;
    }
    window.localStorage.setItem(key, value);
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (getStoredValue('authSessionRevoked') === '1') {
        throw new Error('Session revoked');
    }

    const token = getStoredValue('accessToken');

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
        return null as unknown as T;
    }

    return response.json() as Promise<T>;
}