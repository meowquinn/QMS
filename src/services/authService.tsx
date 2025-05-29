// src/services/authService.ts
import axios from 'axios';

// URL của API backend - giữ lại để sử dụng trong service này
const API_URL = 'https://localhost:7021/api';

// Interface cho dữ liệu đăng nhập trả về
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

// Hàm đăng nhập - cập nhật để phù hợp với tên trường trong DB
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, 
      { 
        username, 
        password // Đổi từ password sang sPassword
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    localStorage.setItem('token', response.data.data.token ?? '');
    localStorage.setItem('user', JSON.stringify({
      staffId: response.data.data.staffId,         // Cập nhật theo đúng tên trường
      username: response.data.data.username,
      fullName: response.data.data.fullName,       // Cập nhật theo đúng tên trường
      sRole: response.data.data.sRole,             // Cập nhật theo đúng tên trường
      access: response.data.data.access,
      email: response.data.data.email,             // Thêm email
      phoneNumber: response.data.data.phoneNumber, // Thêm phoneNumber
      sAddress: response.data.data.sAddress        // Thêm sAddress
    }));
    
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.');
  }
};

// Các hàm khác giữ nguyên
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Cập nhật interface cho user từ localStorage
interface User {
  staffId: number;
  username: string;
  fullName: string;
  sRole: string;
  access: string;
  email: string;
  phoneNumber: string;
  sAddress?: string;
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};