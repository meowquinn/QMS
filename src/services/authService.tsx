// src/services/authService.ts
import axios from 'axios';

// URL của API backend - giữ lại để sử dụng trong service này
const API_URL = 'https://localhost:7021/api';

// Interface cho dữ liệu đăng nhập trả về
interface LoginResponse {
  staffId: number;
  username: string;
  fullName: string; 
  sRole: string;
  access: string;
  email?: string;
  phoneNumber?: string;
  sAddress?: string;   // Thêm field sAddress, optional

}

// Hàm đăng nhập - cập nhật để phù hợp với tên trường trong DB
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, 
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Lấy staff từ response
    const staff = response.data.staff;

    localStorage.setItem('user', JSON.stringify({
      staffId: staff.staffId,
      username: staff.username,
      fullName: staff.fullName,
      sRole: staff.sRole,
      access: staff.access,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      sAddress: staff.sAddress
    }));

    return staff; // trả về đúng kiểu LoginResponse
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.');
  }
};

// Các hàm khác giữ nguyên
export const logout = (): void => {
  localStorage.removeItem('user');
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