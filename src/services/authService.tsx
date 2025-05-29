// src/services/authService.ts
import axios from 'axios';
import { type User } from '../contexts/AuthContext';

// Định nghĩa interface cho phản hồi đăng nhập
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

// URL API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Gọi API đăng nhập
 * @param username Tên đăng nhập
 * @param password Mật khẩu
 * @returns Promise với kết quả đăng nhập
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    // Gọi API đăng nhập
    const response = await axios.post<LoginResponse>(`${API_URL}/api/Auth/login`, { username, password });
    
    console.log('Login API response:', response.data);
    
    // Xử lý và lưu thông tin khi đăng nhập thành công
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      
      // Cấu hình axios để gửi token trong header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Xử lý lỗi từ API
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LoginResponse;
    }
    
    // Trả về lỗi nếu không connect được đến server
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
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

/**
 * Lấy thông tin người dùng hiện tại từ localStorage
 * @returns Thông tin user hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Lấy token JWT hiện tại
 * @returns Token hoặc null nếu chưa đăng nhập
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Đăng xuất người dùng
 */
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // Xóa Authorization header
  delete axios.defaults.headers.common['Authorization'];
  
  // Chuyển hướng về trang login
  window.location.href = '/login';
};