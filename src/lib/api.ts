/**
 * API Client for MongoDB Backend
 * Base URL for all API requests
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for making API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export const api = {
    // Auth endpoints
    auth: {
        login: (email: string, password: string) =>
            apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
        logout: () =>
            apiRequest('/auth/logout', { method: 'POST' }),
    },

    // Profile endpoints
    profiles: {
        getAll: (role?: string) =>
            apiRequest(`/profiles${role ? `?role=${role}` : ''}`),
        getById: (id: string) =>
            apiRequest(`/profiles/${id}`),
        create: (data: any) =>
            apiRequest('/profiles', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: any) =>
            apiRequest(`/profiles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            apiRequest(`/profiles/${id}`, { method: 'DELETE' }),
    },

    // Student endpoints
    students: {
        getAll: () => apiRequest('/students'),
        getById: (id: string) => apiRequest(`/students/${id}`),
        getByUserId: (userId: string) => apiRequest(`/students/user/${userId}`),
        create: (data: any) =>
            apiRequest('/students', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: any) =>
            apiRequest(`/students/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            apiRequest(`/students/${id}`, { method: 'DELETE' }),
    },

    // Company endpoints
    companies: {
        getAll: () => apiRequest('/companies'),
        getById: (id: string) => apiRequest(`/companies/${id}`),
        create: (data: any) =>
            apiRequest('/companies', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: any) =>
            apiRequest(`/companies/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            apiRequest(`/companies/${id}`, { method: 'DELETE' }),
    },

    // Application endpoints
    applications: {
        getAll: () => apiRequest('/applications'),
        getByStudent: (studentId: string) => apiRequest(`/applications/student/${studentId}`),
        getByCompany: (companyId: string) => apiRequest(`/applications/company/${companyId}`),
        getStats: () => apiRequest('/applications/stats'),
        create: (data: { student_id: string; company_id: string }) =>
            apiRequest('/applications', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: { status: string }) =>
            apiRequest(`/applications/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            apiRequest(`/applications/${id}`, { method: 'DELETE' }),
    },
};
