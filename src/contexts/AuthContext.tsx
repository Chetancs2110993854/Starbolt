import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const buildUserFromProfile = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role as UserRole,
  createdAt: new Date(profile.created_at),
  updatedAt: new Date(profile.updated_at),
  businessName: profile.role === 'client' ? profile.business_name : undefined,
  phoneVerified: profile.role === 'intern' ? profile.phone_verified : undefined,
  commissionEarned: profile.role === 'intern' ? profile.commission_earned : undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setIsLoading(true);
      try {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          localStorage.removeItem('starboost_user');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'Failed to handle auth change');
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!profile) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('User not found');

      const metadata = authUser.user_metadata;

      const { error: insertError } = await supabase.from('users').insert([{
        id: authUser.id,
        name: metadata.name || 'New User',
        email: authUser.email,
        role: metadata.role || 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      if (insertError) throw insertError;

      const { data: newProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const newUser = buildUserFromProfile(newProfile);
      setUser(newUser);
      localStorage.setItem('starboost_user', JSON.stringify(newUser));
    } else {
      const currentUser = buildUserFromProfile(profile);
      setUser(currentUser);
      localStorage.setItem('starboost_user', JSON.stringify(currentUser));
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      throw signInError;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    setIsLoading(true);
    clearError();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      throw signUpError;
    }

    // Supabase triggers `onAuthStateChange`, so profile will be handled there
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    clearError();

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
        throw error;
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    } else {
      setUser(null);
      localStorage.removeItem('starboost_user');
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};