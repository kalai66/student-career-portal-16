import { api } from './api';

// Session management using localStorage
const SESSION_KEY = 'current_session';

export interface Profile {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'staff' | 'admin' | 'super_admin';
    created_at: string;
}

export interface Session {
    user: Profile;
    expires_at: number;
}

// Get current session from localStorage
export function getCurrentSession(): Session | null {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    try {
        const session: Session = JSON.parse(sessionData);
        // Check if session is expired
        if (session.expires_at < Date.now()) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

// Create a new session
function createSession(user: Profile): Session {
    const session: Session = {
        user,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

// Clear current session
export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
}

// Login with email and password
export async function login(email: string, password: string): Promise<{ user: Profile; session: Session } | null> {
    try {
        const response = await api.auth.login(email, password);

        if (response.user) {
            const session = createSession(response.user);
            return { user: response.user, session };
        }

        return null;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Logout
export async function logout(): Promise<void> {
    try {
        await api.auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearSession();
    }
}

// Get user by ID
export async function getUserById(userId: string): Promise<Profile | undefined> {
    try {
        return await api.profiles.getById(userId);
    } catch (error) {
        console.error('Error getting user:', error);
        return undefined;
    }
}

// Create new user
export async function createUser(userData: { name: string; email: string; password: string; role: string }): Promise<Profile> {
    return await api.profiles.create(userData);
}

// Update user
export async function updateUser(userId: string, updates: Partial<Profile>): Promise<void> {
    await api.profiles.update(userId, updates);
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
    await api.profiles.delete(userId);
}

// Update password
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
    await api.profiles.update(userId, { password: newPassword });
}

// Check if user has role
export function hasRole(user: Profile | null, role: string | string[]): boolean {
    if (!user) return false;
    if (Array.isArray(role)) {
        return role.includes(user.role);
    }
    return user.role === role;
}
