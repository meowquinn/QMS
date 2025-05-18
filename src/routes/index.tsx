import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';

// Lazy loaded pages
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const WaterParameters = React.lazy(() => import('../pages/QualityTracking/WaterParameters'));
const QualityAlerts = React.lazy(() => import('../pages/QualityTracking/QualityAlerts'));
const PoolList = React.lazy(() => import('../pages/Pools/Pools'));
const Staff = React.lazy(() => import('../pages/Staff/Staff'));
const Inventory = React.lazy(() => import('../pages/Inventory/Inventory'));
const Login = React.lazy(() => import('../pages/Login/Login'));


const AppRoutes: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Đang tải...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Main routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Quality Tracking */}
            <Route path="/quality-tracking/parameters" element={<WaterParameters />} />
            <Route path="/quality-tracking/alerts" element={<QualityAlerts />} />
            
            {/* Pools */}
            <Route path="/pools" element={<PoolList />} />
            
            {/* Staff */}
            <Route path="/staff" element={<Staff />} />
            
            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />
            
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRoutes;
