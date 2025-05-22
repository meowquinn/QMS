// src/services/authService.ts
import axios from 'axios';

// URL của API backend
const API_URL = 'https://localhost:7021/api'; // Cập nhật lại URL và port theo cấu hình của bạn

// URL riêng cho Staff API
export const STAFF_API_URL = 'https://localhost:7021/api/Staff'; // URL API cho staff

// Interface cho dữ liệu đăng nhập trả về
interface LoginResponse {
  id: number;
  username: string;
  name: string;
  role: string;
  access: string;
  token: string;
}

// Hàm đăng nhập
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
    
    // Lưu token vào localStorage để sử dụng cho các request sau này
    localStorage.setItem('token', response.data.token);
    
    // Có thể lưu thêm thông tin người dùng nếu cần
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

// Hàm đăng xuất
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Xóa thông tin người dùng nếu có lưu
};

// Kiểm tra người dùng đã đăng nhập hay chưa
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Hàm tạo axios instance với header Authentication
export const createAuthAxios = () => {
  const token = localStorage.getItem('token');
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

// Hàm tiện ích để gọi Staff API
export const callStaffAPI = async () => {
  try {
    const authAxios = createAuthAxios();
    const response = await authAxios.get('/Staff'); // Sử dụng endpoint Staff
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi Staff API:', error);
    throw new Error('Không thể lấy dữ liệu nhân viên');
  }
};