import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layouts/MainLayout/MainLayout';
import { Spin } from 'antd';

// Loading component với Spin từ Ant Design để UX tốt hơn
const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// Import các trang với React.lazy
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const WaterParameters = React.lazy(() => import('../pages/QualityTracking/WaterParameters'));
const WaterQualityRecords = React.lazy(() => import('../pages/QualityTracking/WaterQualityRecords'));
const PoolList = React.lazy(() => import('../pages/Pools/Pools'));
const Staff = React.lazy(() => import('../pages/Staff/Staff'));
const Inventory = React.lazy(() => import('../pages/Inventory/Inventory'));
const Login = React.lazy(() => import('../pages/Login/Login'));

// Protected Route component
const ProtectedRoute = ({ isAllowed = false, redirectPath = '/login', children }: {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
}) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children || <Outlet />}</>;
};

const AppRoutes: React.FC = () => {
  const { user, login, isAdmin } = useAuth();
  
  // Logging để debug
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);
  }, [user, isAdmin]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected Routes trong MainLayout */}
          <Route element={<ProtectedRoute isAllowed={!!user} />}>
            <Route element={<MainLayout />}>
              {/* Dashboard - cho tất cả người dùng đã đăng nhập */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Routes cho tất cả người dùng đã đăng nhập */}
              <Route path="/staff" element={<Staff />} />
              <Route path="/pools" element={<PoolList />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/quality/records" element={<WaterQualityRecords />} />
              <Route path="/quality/parameters" element={<WaterParameters />} />
            </Route>
          </Route>
          
          {/* Catch All Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;

