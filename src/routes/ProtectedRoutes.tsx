import React, { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu User
export interface User {
  username: string;
  name: string;
  role: string;
  access: 'admin' | 'user';
}

interface ProtectedRoutesProps {
  user: User | null;
  onLogout: () => void;
}

// Component bảo vệ routes và áp dụng layout chung
const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ user, onLogout }) => {
  // Nếu người dùng chưa đăng nhập, chuyển hướng về trang login
  if (!user) {
    console.log("Access denied: User not authenticated");
    return <Navigate to="/login" replace />;
  }

  // Nếu người dùng đã đăng nhập, render layout chung với các routes con
  return (
    <MainLayout user={user} onLogout={onLogout}>
      <Outlet />
    </MainLayout>
  );
};

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({children }) => {
  return (
    <div>
      {/* ...your layout code... */}
      {children}
    </div>
  );
};

export default ProtectedRoutes;