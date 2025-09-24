import apiClient from './apiClient';
import { ApiResponse } from '../types/common';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  status?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  status?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userService = {
  // Get all users with pagination and filtering
  getUsers: async (filters: UserFilters = {}): Promise<ApiResponse<UserListResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);

    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserData): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Change user password
  changePassword: async (id: string, data: { currentPassword?: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await apiClient.patch(`/users/${id}/password`, data);
    return response.data;
  },
};