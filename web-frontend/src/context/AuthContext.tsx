import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { User, AuthContextType, SignupData } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      // If we have a stored user (from test login), use it
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    if (token) {
      authAPI.getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { user, token } = await authAPI.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Welcome back!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const signup = async (signupData: SignupData): Promise<void> => {
    try {
      const { user, token } = await authAPI.signup(signupData);
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('You have been logged out');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};