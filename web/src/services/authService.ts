import apiClient from './apiClient';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    preferences: any;
    updated_at: string;
}

type AuthListener = (session: any) => void;
const listeners: AuthListener[] = [];

const notifyListeners = (session: any) => {
    listeners.forEach(listener => listener(session));
};

export const authService = {
    async signup(email: string, password: string, fullName: string) {
        const data = await apiClient.post<any>('/auth/signup', { email, password, full_name: fullName });
        if (data.session) {
            localStorage.setItem('gaia_session', JSON.stringify(data.session));
            localStorage.setItem('gaia_user', JSON.stringify(data.session.user));
            notifyListeners(data.session);
        }
        return data;
    },

    async login(email: string, password: string) {
        const data = await apiClient.post<any>('/auth/login', { email, password });
        if (data.session) {
            localStorage.setItem('gaia_session', JSON.stringify(data.session));
            localStorage.setItem('gaia_user', JSON.stringify(data.session.user));
            notifyListeners(data.session);
        }
        return data;
    },

    async logout() {
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            console.error('Logout request failed:', e);
        }
        localStorage.removeItem('gaia_session');
        localStorage.removeItem('gaia_user');
        notifyListeners(null);
    },

    async signInWithOAuth(provider: 'google' | 'github') {
        const data = await apiClient.get<any>(`/auth/oauth/${provider}`);
        if (data.url) {
            window.location.href = data.url;
        }
    },

    async getProfile(): Promise<UserProfile> {
        return apiClient.get<UserProfile>('/auth/profile');
    },

    async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
        const updated = await apiClient.patch<UserProfile>('/auth/profile', profile);
        // Sync local user data if needed
        return updated;
    },

    async getCurrentUser() {
        const user = localStorage.getItem('gaia_user');
        return user ? JSON.parse(user) : null;
    },

    async getSession() {
        const session = localStorage.getItem('gaia_session');
        return session ? JSON.parse(session) : null;
    },

    onAuthStateChange(callback: AuthListener) {
        listeners.push(callback);
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        const index = listeners.indexOf(callback);
                        if (index !== -1) listeners.splice(index, 1);
                    }
                }
            }
        };
    },

    notifyAuthListeners(session: any) {
        notifyListeners(session);
    }
};
