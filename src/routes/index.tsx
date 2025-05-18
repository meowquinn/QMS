import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';

// Lazy loaded pages
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const WaterParameters = React.lazy(() => import('../pages/QualityTracking/WaterParameters'));
const QualityAlerts = React.lazy(() => import('../pages/QualityTracking/QualityAlerts'));
const BalanceConcentration = React.lazy(() => import('../pages/TreatmentProcess/BalanceConcentration'));
const Maintenance = React.lazy(() => import('../pages/TreatmentProcess/Maintenance'));
const PoolList = React.lazy(() => import('../pages/Pools/Pools'));
const StaffList = React.lazy(() => import('../pages/Staff/StaffList'));
const AccessControl = React.lazy(() => import('../pages/Staff/AccessControl'));
const InventoryIn = React.lazy(() => import('../pages/Inventory/InventoryIn'));
const InventoryOut = React.lazy(() => import('../pages/Inventory/InventoryOut'));
const InventoryStock = React.lazy(() => import('../pages/Inventory/InventoryStock'));
const PoolListReport = React.lazy(() => import('../pages/Reports/PoolListReport'));
const DailyWaterQuality = React.lazy(() => import('../pages/Reports/DailyWaterQuality'));
const ChemicalUsage = React.lazy(() => import('../pages/Reports/ChemicalUsage'));

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Đang tải...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Main routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Quality Tracking */}
            <Route path="/quality-tracking/parameters" element={<WaterParameters />} />
            <Route path="/quality-tracking/alerts" element={<QualityAlerts />} />
            
            {/* Treatment Process */}
            <Route path="/treatment-process/balance" element={<BalanceConcentration />} />
            <Route path="/treatment-process/maintenance" element={<Maintenance />} />
            
            {/* Pools */}
            <Route path="/pools" element={<PoolList />} />
            
            {/* Staff */}
            <Route path="/staff/list" element={<StaffList />} />
            <Route path="/staff/access-control" element={<AccessControl />} />
            
            {/* Inventory */}
            <Route path="/inventory/in" element={<InventoryIn />} />
            <Route path="/inventory/out" element={<InventoryOut />} />
            <Route path="/inventory/stock" element={<InventoryStock />} />
            
            {/* Reports */}
            <Route path="/reports/pool-list" element={<PoolListReport />} />
            <Route path="/reports/daily-water-quality" element={<DailyWaterQuality />} />
            <Route path="/reports/chemical-usage" element={<ChemicalUsage />} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
};

export default AppRoutes;
