import apiClient from './apiClient';
import { ApiResponse } from '@/types/common';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
  }>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (data: RegisterData): Promise<ApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
  }>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse<{
    user: User;
    token: string;
  }>> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.put('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};
