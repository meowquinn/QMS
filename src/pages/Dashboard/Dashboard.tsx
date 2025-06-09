import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaWater, FaFlask } from 'react-icons/fa';
import { message, Spin } from 'antd';
import { getDashboardSummary } from '../../services/dashboardService';
import type { DashboardStats } from '../../services/types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await getDashboardSummary();
        console.log("Summary response:", summaryRes); // Debug
        console.log("Summary response data:", summaryRes?.data); // Debug thêm
        
        // Thử các cách khác nhau để lấy data
        let statsData = null;
        
        if (summaryRes?.success && summaryRes?.data) {
          // Nếu API trả về { success: true, data: {...} }
          statsData = summaryRes.data;
        } else if (summaryRes?.data) {
          // Nếu API trả về { data: {...} }
          statsData = summaryRes.data;
        } else if (summaryRes) {
          // Nếu API trả về trực tiếp object
          statsData = summaryRes;
        }
        
        console.log("Final stats data:", statsData); // Debug
        setDashboardStats(statsData);

      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu tổng quan!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Thêm debug để xem state
  console.log("Current dashboardStats state:", dashboardStats);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng số hồ bơi</p>
              <p className="text-2xl font-bold">{dashboardStats?.totalPools}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaWater className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-500 font-medium">
              {dashboardStats?.activePools} hoạt động
            </span>
            <span className="ml-2 text-orange-500 font-medium">
              {dashboardStats?.maintenancePools} bảo trì
            </span>
            <span className="ml-2 text-red-500 font-medium">
              {dashboardStats?.closedPools} đóng cửa
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cảnh báo</p>
              <p className="text-2xl font-bold">
                {dashboardStats?.totalAlerts}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-red-500 font-medium">
              {dashboardStats?.criticalAlerts} nghiêm trọng
            </span>
            <span className="ml-1 text-orange-500 font-medium">
              , {dashboardStats?.warningAlerts} cảnh báo
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đo nước hôm nay</p>
              <p className="text-2xl font-bold">
                {dashboardStats?.todayMeasurements}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaFlask className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-500 font-medium">
              {dashboardStats?.todayMeasurements} báo cáo đã nhận
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
