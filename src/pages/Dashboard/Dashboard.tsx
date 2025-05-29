import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { FaExclamationTriangle, FaCheckCircle, FaWater, FaFlask } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Log để debug
  useEffect(() => {
    console.log('Dashboard rendered, user:', user);
  }, [user]);

  // Sample data
  const poolStats = {
    total: 5,
    active: 4,
    underMaintenance: 1,
  };

  const qualityAlerts = [
    { id: 1, poolName: 'Hồ bơi A', parameter: 'pH', value: 8.2, status: 'warning', time: '09:30' },
    { id: 2, poolName: 'Hồ bơi C', parameter: 'Clo', value: 0.4, status: 'danger', time: '08:15' },
  ];

  const recentMeasurements = [
    { id: 1, poolName: 'Hồ bơi A', pH: 7.4, chlorine: 1.5, temp: 28, lastUpdated: '09:30' },
    { id: 2, poolName: 'Hồ bơi B', pH: 7.6, chlorine: 2.1, temp: 27, lastUpdated: '09:15' },
    { id: 3, poolName: 'Hồ bơi C', pH: 7.2, chlorine: 0.4, temp: 29, lastUpdated: '08:15' },
    { id: 4, poolName: 'Hồ bơi D', pH: 7.5, chlorine: 1.8, temp: 28, lastUpdated: '08:00' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">
        Xin chào, {user?.fullName || 'Người dùng'}!
      </h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Hồ bơi" value={poolStats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Nhân viên" value={10} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="Kiểm định chất lượng" value={120} />
          </Card>
        </Col>
      </Row>

      <h2 className="text-xl font-semibold mt-8 mb-4">Trạng thái hệ thống</h2>

      <Card title="Thông tin nhanh">
        <p>
          Đây là phiên bản 1.0 của Hệ thống Quản lý Chất lượng Hồ bơi (Pool QMS). 
          Hệ thống này giúp quản lý chất lượng nước và các hoạt động bảo trì hồ bơi.
        </p>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng số hồ bơi</p>
              <p className="text-2xl font-bold">{poolStats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaWater className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-500 font-medium">{poolStats.active} hoạt động</span>
            {poolStats.underMaintenance > 0 && (
              <span className="ml-2 text-orange-500 font-medium">{poolStats.underMaintenance} bảo trì</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cảnh báo</p>
              <p className="text-2xl font-bold">{qualityAlerts.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-red-500 font-medium">1 nghiêm trọng</span>,
            <span className="ml-1 text-orange-500 font-medium">1 cảnh báo</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đo nước hôm nay</p>
              <p className="text-2xl font-bold">{recentMeasurements.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaFlask className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-500 font-medium">
              {recentMeasurements.length} báo cáo đã nhận
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
              {recentMeasurements.map((measurement) => (
                <tr key={measurement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {measurement.poolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      measurement.pH < 7.2 || measurement.pH > 7.8 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {measurement.pH}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      measurement.chlorine < 1.0 || measurement.chlorine > 3.0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {measurement.chlorine}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.temp}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.lastUpdated}
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
