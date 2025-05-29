import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layouts/MainLayout/MainLayout';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Staff from '../pages/Staff/Staff';
import PoolList from '../pages/Pools/Pools';
import Inventory from '../pages/Inventory/Inventory';
import WaterQualityRecords from '../pages/QualityTracking/WaterQualityRecords';
import WaterParameters from '../pages/QualityTracking/WaterParameters';
import { Spin } from 'antd';

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// Protected Route component (không cần thiết nếu bạn kiểm tra trong route trực tiếp)
const AppRoutes: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  // Thêm log để kiểm tra
  useEffect(() => {
    console.log('AppRoutes - User:', user);
    console.log('AppRoutes - Is Admin:', isAdmin);
  }, [user, isAdmin]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Login route */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          
          {/* Default route */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          
          {/* Dashboard và các trang được bảo vệ */}
          {user ? (
            <Route path="/" element={<MainLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              {isAdmin && <Route path="staff" element={<Staff />} />}
              <Route path="pools" element={<PoolList />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="quality/records" element={<WaterQualityRecords />} />
              <Route path="quality/parameters" element={<WaterParameters />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;

