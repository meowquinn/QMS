import React, { createContext, useState, useEffect, useContext } from 'react';

// Định nghĩa kiểu dữ liệu User
interface User {
  username: string;
  name: string;
  role: string;
  access: 'admin' | 'user';
}

// Định nghĩa interface cho AuthContext
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

// Create context với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false
});

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.access === 'admin';

  // Kiểm tra người dùng đã đăng nhập từ session storage khi component mount
  useEffect(() => {
    const userFromStorage = sessionStorage.getItem('user');
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage) as User;
        setUser(parsedUser);
        console.log("User restored from storage:", parsedUser);
      } catch (error) {
        console.error("Failed to parse user from storage:", error);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Hàm login
  const login = (userData: User) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log("User logged in:", userData);
  };

  // Hàm logout
  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;