import React, { createContext, useState, useEffect, useContext } from 'react';

// Định nghĩa kiểu dữ liệu User phù hợp với API
export interface User {
  staffId: number;
  username: string;
  fullName: string; 
  sRole: string;
  access: string;
  email?: string;
  phoneNumber?: string;
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
  
  // Khôi phục user từ localStorage khi load trang
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Tính toán các properties
  const isAuthenticated = user !== null;
  const isAdmin = user?.access === 'admin' || user?.sRole === 'Admin';

  // Hàm login
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Xóa authorization header
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