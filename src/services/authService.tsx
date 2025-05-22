// src/services/authService.ts
import axios from 'axios';

// URL của API backend - giữ lại để sử dụng trong service này
const API_URL = 'https://localhost:7021/api';

// Interface cho dữ liệu đăng nhập trả về
interface LoginResponse {
  staffId: number;  // Đổi từ id sang staffId theo SQL
  username: string;
  fullName: string;  // Đổi từ name sang fullName
  sRole: string;     // Đổi từ role sang sRole
  access: string;
  token: string;
  email: string;     // Thêm field email
  phoneNumber: string; // Thêm field phoneNumber
  sAddress?: string;   // Thêm field sAddress, optional
}

// Hàm đăng nhập - cập nhật để phù hợp với tên trường trong DB
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/Auth/login`, 
      { 
        username, 
        sPassword: password // Đổi từ password sang sPassword
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      staffId: response.data.staffId,         // Cập nhật theo đúng tên trường
      username: response.data.username,
      fullName: response.data.fullName,       // Cập nhật theo đúng tên trường
      sRole: response.data.sRole,             // Cập nhật theo đúng tên trường
      access: response.data.access,
      email: response.data.email,             // Thêm email
      phoneNumber: response.data.phoneNumber, // Thêm phoneNumber
      sAddress: response.data.sAddress        // Thêm sAddress
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