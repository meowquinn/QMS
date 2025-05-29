// src/services/authService.ts
import axios from 'axios';
import { type User } from '../contexts/AuthContext';

// Định nghĩa kiểu dữ liệu trả về từ API đăng nhập
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    staffId: number;
    username: string;
    fullName: string;
    sRole: string;
    access: string;
    email: string;
    phoneNumber: string;
    sAddress?: string;
    token?: string;
  };
}

// Lấy API URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    // Gọi API đăng nhập
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    
    // Lưu token nếu có
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    // Lưu thông tin người dùng vào localStorage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify({
        staffId: response.data.data.staffId,
        username: response.data.data.username,
        fullName: response.data.data.fullName,
        sRole: response.data.data.sRole,
        access: response.data.data.access,
        email: response.data.data.email,
        phoneNumber: response.data.data.phoneNumber,
        sAddress: response.data.data.sAddress
      }));
    }
    
    return response.data;
  } catch (error) {
    // Xử lý lỗi mạng hoặc lỗi server
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LoginResponse;
    }
    
    // Trả về lỗi generic nếu không phải lỗi API
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ',
      data: {
        staffId: 0,
        username: '',
        fullName: '',
        sRole: '',
        access: '',
        email: '',
        phoneNumber: '',
        sAddress: '',
        token: ''
      }
    };
  }
};

// Lấy thông tin người dùng hiện tại từ localStorage
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

// Lấy token hiện tại
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Đăng xuất
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/login';
};