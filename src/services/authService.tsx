// src/services/authService.ts
import axios from 'axios';

// URL của API backend - giữ lại để sử dụng trong service này
const API_URL = 'https://localhost:7021/api';

// Interface cho dữ liệu đăng nhập trả về
interface LoginResponse {
  id: number;
  username: string;
  name: string;
  role: string;
  access: string;
  token: string;
}

// Hàm đăng nhập - giữ nguyên
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/Auth/login`, 
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.id,
      username: response.data.username,
      name: response.data.name,
      role: response.data.role,
      access: response.data.access
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

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};