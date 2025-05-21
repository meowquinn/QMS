import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layouts/MainLayout/MainLayout';

// Loading component
const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <div className="text-xl font-bold">Đang tải...</div>
  </div>
);

// Import các trang
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const WaterParameters = React.lazy(() => import('../pages/QualityTracking/WaterParameters'));
const WaterQualityRecords = React.lazy(() => import('../pages/QualityTracking/WaterQualityRecords'));
const PoolList = React.lazy(() => import('../pages/Pools/Pools'));
const Staff = React.lazy(() => import('../pages/Staff/Staff'));
const Inventory = React.lazy(() => import('../pages/Inventory/Inventory'));
const Login = React.lazy(() => import('../pages/Login/Login'));

// Trang bảo vệ cho Admin

const AppRoutes: React.FC = () => {
  const { user, login } = useAuth();
  
  // Thêm logging để debug
  useEffect(() => {
    console.log('AppRoutes mounted');
    console.log('Current user:', user);
  }, [user]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected Routes với Layout chung */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={
              user ? <Dashboard /> : <Navigate to="/login" />
            } />
            
            {/* Admin Routes */}
            <Route path="/staff" element={
              user ? <Staff /> : <Navigate to="/login" />
            } />
            
            {/* Regular Protected Routes */}
            <Route path="/pools" element={
              user ? <PoolList /> : <Navigate to="/login" />
            } />
            <Route path="/inventory" element={
              user ? <Inventory /> : <Navigate to="/login" />
            } />
            <Route path="/quality/records" element={
              user ? <WaterQualityRecords /> : <Navigate to="/login" />
            } />
            <Route path="/quality/parameters" element={
              user ? <WaterParameters /> : <Navigate to="/login" />
            } />
          </Route>
          
          {/* Catch All Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;

