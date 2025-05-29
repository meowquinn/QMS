import React, { createContext, useState, useEffect, useContext } from 'react';

// Định nghĩa kiểu dữ liệu User
export interface User {
  staffId: number;
  username: string;
  fullName: string;
  sRole: string;
  access: string;
  email: string;
  phoneNumber: string;
  sAddress?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

// Tạo context
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isAuthenticated: false
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Kiểm tra người dùng đã đăng nhập từ localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider: Restoring user from localStorage:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error);
      localStorage.removeItem('user');
    }
  }, []);

  // Tính toán các giá trị liên quan
  const isAuthenticated = user !== null;
  const isAdmin = user?.sRole === 'Admin' || user?.access === 'admin';

  // Hàm login
  const login = (userData: User) => {
    console.log('AuthProvider: Setting user:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Hàm logout
  const logout = () => {
    console.log('AuthProvider: Logging out');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;