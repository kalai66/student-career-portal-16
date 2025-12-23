import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/lib/auth';
import * as authLib from '@/lib/auth';
import { getCurrentSession, Session } from '@/lib/auth';

// Define UserRole enum for better type safety
export enum UserRole {
  STUDENT = 'student',
  STAFF = 'staff',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

interface AuthContextType {
  currentUser: Profile | null;
  session: Session | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCredentials: (email: string, password: string) => Promise<void>;
  isSuperAdmin: () => boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const existingSession = getCurrentSession();
        if (existingSession) {
          setSession(existingSession);
          setCurrentUser(existingSession.user);
          setUserRole(existingSession.user.role);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const isSuperAdmin = () => {
    // Check if this is the specific super admin email/credential
    if (currentUser?.email === 'blue67388@gmail.com') {
      return true;
    }

    // Or check for the role
    return userRole === UserRole.SUPER_ADMIN ||
      currentUser?.role === 'super_admin';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login:', email);

      // Use the login function from auth.ts
      const result = await authLib.login(email, password);
      console.log('✅ Login result:', result);

      if (result) {
        setCurrentUser(result.user);
        setSession(result.session);
        setUserRole(result.user.role);

        console.log('✅ User authenticated:', {
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        });

        toast({
          title: "Login successful",
          description: `Welcome ${result.user.name}!`,
        });
        return true;
      }

      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authLib.logout();
      setCurrentUser(null);
      setSession(null);
      setUserRole(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const updateCredentials = async (email: string, password: string) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Update in database
      const { updateUser, updatePassword } = await import('@/lib/auth');

      if (email !== currentUser.email) {
        await updateUser(currentUser._id, { email });
      }

      if (password) {
        await updatePassword(currentUser._id, password);
      }

      // Update current user state
      const updatedUser = { ...currentUser, email };
      setCurrentUser(updatedUser);

      // Update session
      if (session) {
        const updatedSession = { ...session, user: updatedUser };
        setSession(updatedSession);
        localStorage.setItem('current_session', JSON.stringify(updatedSession));
      }

      toast({
        title: "Credentials updated",
        description: "Your account information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating credentials:', error);
      toast({
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        userRole,
        login,
        logout,
        updateCredentials,
        isSuperAdmin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook that enforces context usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
