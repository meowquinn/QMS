import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaWater, FaFlask } from 'react-icons/fa';
import { message, Spin } from 'antd';
import { getDashboardSummary, getQualityAlerts, getLatestMeasurements } from '../../services/dashboardService';
import type { DashboardStats, QualityAlert, Measurement } from '../../services/types';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await getDashboardSummary();
        setDashboardStats(summaryRes?.data || null);

        const alertsRes = await getQualityAlerts();
        setQualityAlerts(alertsRes?.data || []);

        const latestRes = await getLatestMeasurements();
        setRecentMeasurements(latestRes?.data || []);
      } catch {
        message.error("Không thể tải dữ liệu tổng quan!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      {/* Stats cards */}
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
            {dashboardStats?.maintenancePools && dashboardStats.maintenancePools > 0 && (
              <span className="ml-2 text-orange-500 font-medium">
                {dashboardStats.maintenancePools} bảo trì
              </span>
            )}
            {dashboardStats?.closedPools && dashboardStats.closedPools > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                {dashboardStats.closedPools} đóng cửa
              </span>
            )}
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
            {dashboardStats?.warningAlerts && dashboardStats.warningAlerts > 0 && (
              <span className="ml-1 text-orange-500 font-medium">
                , {dashboardStats.warningAlerts} cảnh báo
              </span>
            )}
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
      {/* Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Cảnh báo chất lượng nước</h2>
        </div>
        <div className="p-4">
          {qualityAlerts.length === 0 ? (
            <div className="text-center py-4">
              <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
              <p className="text-gray-600">Không có cảnh báo nào!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {qualityAlerts.map((alert) => (
                <div key={alert.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${alert.status === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <FaExclamationTriangle className={`${alert.status === 'danger' ? 'text-red-500' : 'text-yellow-500'} text-lg`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{alert.poolName}</p>
                      <p className="text-sm text-gray-500">
                        {alert.parameter} {alert.value} - {alert.status === 'danger' ? 'Nghiêm trọng' : 'Cảnh báo'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {alert.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Recent measurements */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Đo lường gần đây</h2>
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
                  Cập nhật lúc
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMeasurements.map((measurement, index) => (
                <tr key={measurement.id || measurement.recordId || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {measurement.poolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.pH}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.chlorine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.temperature}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
