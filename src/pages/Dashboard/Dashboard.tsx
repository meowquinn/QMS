import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaWater, FaFlask } from 'react-icons/fa';
import { message, Spin } from 'antd';
import { getDashboardSummary } from '../../services/dashboardService';
import type { DashboardStats, WaterQualityRecord } from '../../services/types'
import { getWaterQualityHistory } from '../../services/waterQualityService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentMeasurements, setRecentMeasurements] = useState<WaterQualityRecord[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await getDashboardSummary();
        let statsData = null;
        
        if (summaryRes?.success && summaryRes?.data) {
          statsData = summaryRes.data;
        } else if (summaryRes?.data) {
          statsData = summaryRes.data;
        } else if (summaryRes) {
          statsData = summaryRes;
        }
      
        // Lấy dữ liệu đo lường
        const latestRes = await getWaterQualityHistory();

        console.log("API Response:", latestRes);
        
        // Chỉ lấy 5 bản ghi đầu tiên (BE đã sort theo thời gian mới nhất)
        const recentRecords = (latestRes?.data || []).slice(0, 5);
        
        console.log("Recent records:", recentRecords);
        console.log("Records length:", recentRecords.length);
        
        setDashboardStats(statsData);
        setRecentMeasurements(recentRecords);

      } catch (error) {
        console.error("Error:", error);
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
      
      {/* 3 cột thống kê chính */}
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
        </div>
      </div>

      {/* Thông tin đo lường gần nhất */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Thông tin đo lường gần nhát</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hồ bơi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  pH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clo (ppm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhiệt độ (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMeasurements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Chưa có dữ liệu đo lường gần nhất
                  </td>
                </tr>
              ) : (
                recentMeasurements.map((record, index) => (
                  <tr key={record.parameterId || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.poolName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        record.pHLevel < 7.2 || record.pHLevel > 7.8 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.pHLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        record.chlorineMgPerL < 1.0 || record.chlorineMgPerL > 3.0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.chlorineMgPerL}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.temperatureC}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.pTimestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.rStatus === 'Normal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.rStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
