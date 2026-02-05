

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        // Get active session for auth header
        const sessionRaw = localStorage.getItem('gaia_session');
        const session = sessionRaw ? JSON.parse(sessionRaw) : null;

        const headers: Record<string, string> = {
            ...options.headers as Record<string, string>,
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle token expiration
            if (response.status === 401 && errorData.error &&
                (errorData.error.includes('Invalid or expired token') ||
                    errorData.error.includes('Unauthorized'))) {
                // Clear session
                localStorage.removeItem('gaia_session');
                localStorage.removeItem('gaia_user');

                // Redirect to landing page
                window.location.href = '/';

                throw new Error('Session expired. Please log in again.');
            }

            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
        return this.fetch<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
        return this.fetch<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
        return this.fetch<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
