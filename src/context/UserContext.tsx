"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_verified: boolean;
  email_verified: boolean;
  kyc_verified: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; token?: string }>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; userId?: string }>;
  logout: () => void;
  verifyOtp: (userId: string, otp: string) => Promise<{ success: boolean; message: string; token?: string }>;
  resendOtp: (userId: string, phone: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login: AuthContextType['login'] = async (identifier, password) => {
    try {
      setLoading(true);
      // Check if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [isEmail ? 'email' : 'phone']: identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      navigate('/dashboard');
      toast.success('Login successful!');
      return { success: true, message: 'Login successful', token: data.token };
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      // Format phone number to include country code if not present
      let phone = userData.phone;
      if (phone && !phone.startsWith('+')) {
        // Default to India (+91) if no country code provided
        phone = `+91${phone.replace(/^0+/, '')}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Send OTP after successful registration
      if (data.user?.id) {
        await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: data.user.id, phone }),
        });
      }

      return { 
        success: true, 
        message: 'Registration successful. Please verify your phone with the OTP sent.',
        userId: data.user?.id
      };
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Update user verification status
      if (data.user) {
        setUser(prev => ({
          ...prev!,
          phone_verified: true,
          ...(data.user)
        }));
      }

      return { 
        success: true, 
        message: data.message || 'Phone number verified successfully!',
        token: data.token
      };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to verify OTP'
      };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (userId: string, phone: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      return { 
        success: true, 
        message: data.message || 'OTP resent successfully' 
      };
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to resend OTP' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        verifyOtp,
        resendOtp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};