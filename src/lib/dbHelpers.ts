/**
 * Database helper utilities for common CRUD operations
 * Now using MongoDB backend APIs instead of IndexedDB
 */

import { api } from './api';
import { Profile } from './auth';

export interface Student {
    _id: string;
    user_id: string;
    resume_url: string | null;
    resume_status: string | null;
    registration_number?: string | null;
    created_at: string;
}

export interface Company {
    _id: string;
    name: string;
    description: string;
    location: string;
    deadline: string;
    posted_by: string;
    positions: string[];
    requirements: string[];
    created_at: string;
}

export interface Application {
    _id: string;
    student_id: string;
    company_id: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    applied_at: string;
    created_at: string;
}

// Profile operations
export const profilesDB = {
    // Get all profiles
    getAll: async (): Promise<Profile[]> => {
        return await api.profiles.getAll();
    },

    // Get profiles by role
    getByRole: async (role: string): Promise<Profile[]> => {
        return await api.profiles.getAll(role);
    },

    // Get profile by ID
    getById: async (id: string): Promise<Profile | undefined> => {
        try {
            return await api.profiles.getById(id);
        } catch (error) {
            return undefined;
        }
    },

    // Get profile by email
    getByEmail: async (email: string): Promise<Profile | undefined> => {
        try {
            const profiles = await api.profiles.getAll();
            return profiles.find((p: Profile) => p.email === email);
        } catch (error) {
            return undefined;
        }
    },

    // Create profile
    create: async (profileData: { name: string; email: string; password: string; role: string }): Promise<Profile> => {
        return await api.profiles.create(profileData);
    },

    // Update profile
    update: async (id: string, updates: Partial<Profile>): Promise<void> => {
        await api.profiles.update(id, updates);
    },

    // Delete profile
    delete: async (id: string): Promise<void> => {
        await api.profiles.delete(id);

        // Also delete related student record if exists
        try {
            const students = await api.students.getAll();
            const studentRecord = students.find((s: Student) => s.user_id === id);
            if (studentRecord) {
                await api.students.delete(studentRecord._id);
            }
        } catch (error) {
            console.error('Error deleting related student record:', error);
        }
    },

    // Count profiles
    count: async (): Promise<number> => {
        const profiles = await api.profiles.getAll();
        return profiles.length;
    },

    // Count by role
    countByRole: async (role: string): Promise<number> => {
        const profiles = await api.profiles.getAll(role);
        return profiles.length;
    }
};

// Student operations
export const studentsDB = {
    // Get all students
    getAll: async (): Promise<Student[]> => {
        return await api.students.getAll();
    },

    // Get student by ID
    getById: async (id: string): Promise<Student | undefined> => {
        try {
            return await api.students.getById(id);
        } catch (error) {
            return undefined;
        }
    },

    // Get student by user_id
    getByUserId: async (userId: string): Promise<Student | undefined> => {
        try {
            return await api.students.getByUserId(userId);
        } catch (error) {
            console.error('Error fetching student by user_id:', error);
            return undefined;
        }
    },

    // Create student
    create: async (studentData: { user_id: string; resume_url?: string | null; resume_status?: string | null; registration_number?: string | null }): Promise<Student> => {
        return await api.students.create(studentData);
    },

    // Update student
    update: async (id: string, updates: Partial<Student>): Promise<void> => {
        await api.students.update(id, updates);
    },

    // Delete student
    delete: async (id: string): Promise<void> => {
        await api.students.delete(id);
    },

    // Delete by user_id
    deleteByUserId: async (userId: string): Promise<void> => {
        const student = await studentsDB.getByUserId(userId);
        if (student) {
            await api.students.delete(student._id);
        }
    },

    // Count students
    count: async (): Promise<number> => {
        const students = await api.students.getAll();
        return students.length;
    }
};

// Company operations
export const companiesDB = {
    // Get all companies
    getAll: async (): Promise<Company[]> => {
        return await api.companies.getAll();
    },

    // Get company by ID
    getById: async (id: string): Promise<Company | undefined> => {
        try {
            return await api.companies.getById(id);
        } catch (error) {
            return undefined;
        }
    },

    // Get companies by posted_by
    getByPostedBy: async (postedBy: string): Promise<Company[]> => {
        try {
            const companies = await api.companies.getAll();
            return companies.filter((c: Company) => c.posted_by === postedBy);
        } catch (error) {
            return [];
        }
    },

    // Create company
    create: async (companyData: { name: string; description: string; location: string; deadline: string; posted_by: string; positions: string[]; requirements: string[] }): Promise<Company> => {
        return await api.companies.create(companyData);
    },

    // Update company
    update: async (id: string, updates: Partial<Company>): Promise<void> => {
        await api.companies.update(id, updates);
    },

    // Delete company
    delete: async (id: string): Promise<void> => {
        await api.companies.delete(id);
    },

    // Count companies
    count: async (): Promise<number> => {
        const companies = await api.companies.getAll();
        return companies.length;
    }
};

// Application operations
export const applicationsDB = {
    // Get all applications
    getAll: async (): Promise<Application[]> => {
        return await api.applications.getAll();
    },

    // Get applications by student
    getByStudent: async (studentId: string): Promise<Application[]> => {
        return await api.applications.getByStudent(studentId);
    },

    // Get applications by company
    getByCompany: async (companyId: string): Promise<Application[]> => {
        return await api.applications.getByCompany(companyId);
    },

    // Get application statistics
    getStats: async (): Promise<any> => {
        return await api.applications.getStats();
    },

    // Create application
    create: async (data: { student_id: string; company_id: string }): Promise<Application> => {
        return await api.applications.create(data);
    },

    // Update application status
    updateStatus: async (id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Promise<void> => {
        await api.applications.update(id, { status });
    },

    // Delete application
    delete: async (id: string): Promise<void> => {
        await api.applications.delete(id);
    },

    // Count applications
    count: async (): Promise<number> => {
        const applications = await api.applications.getAll();
        return applications.length;
    }
};

// Helper to get full user data (profile + student record if applicable)
export const getUserWithDetails = async (userId: string) => {
    const profile = await profilesDB.getById(userId);
    if (!profile) return null;

    if (profile.role === 'student') {
        const studentRecord = await studentsDB.getByUserId(userId);
        return { profile, student: studentRecord };
    }

    return { profile, student: null };
};
