import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaWater, FaFlask } from 'react-icons/fa';
import { message, Spin } from 'antd';
import { getAllPools } from '../../services/poolService';
import { getWaterQualityHistory } from '../../services/waterQualityService';
import type { Pool, WaterQualityRecord } from '../../services/types';

interface QualityAlert {
  id: string;
  poolId: number;
  poolName: string;
  parameter: string;
  value: number;
  status: 'danger' | 'warning';
  time: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [pools, setPools] = useState<Pool[]>([]);
  const [qualityRecords, setQualityRecords] = useState<WaterQualityRecord[]>([]);
  const [recentMeasurements, setRecentMeasurements] = useState<WaterQualityRecord[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);

  const [poolStats, setPoolStats] = useState({
    total: 0,
    active: 0,
    underMaintenance: 0,
  });

  // Hàm để lấy bản ghi mới nhất cho mỗi hồ bơi
  const getLatestRecordsPerPool = (records: WaterQualityRecord[], pools: Pool[]) => {
    const poolMap = new Map();
    
    // Tạo map để ánh xạ poolId với tên hồ bơi
    pools.forEach(pool => {
      poolMap.set(pool.poolsId, pool.poolName);
    });
    
    // Sắp xếp theo thời gian mới nhất trước
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.pTimestamp).getTime() - new Date(a.pTimestamp).getTime()
    );
    
    // Lấy bản ghi mới nhất cho mỗi hồ bơi
    const latestPerPool = new Map();
    sortedRecords.forEach(record => {
      if (!latestPerPool.has(record.poolId)) {
        // Thêm tên hồ bơi vào bản ghi
        record.poolName = poolMap.get(record.poolId) || `Hồ bơi #${record.poolId}`;
        latestPerPool.set(record.poolId, record);
      }
    });
    
    return Array.from(latestPerPool.values());
  };

  // Hàm để lọc ra những cảnh báo về chất lượng nước
  const getQualityAlerts = (records: WaterQualityRecord[], pools: Pool[]) => {
    const poolMap = new Map();
    pools.forEach(pool => {
      poolMap.set(pool.poolsId, pool.poolName);
    });
    
    // Lọc ra những bản ghi có chỉ số bất thường
    const alerts: QualityAlert[] = [];
    
    // Chỉ lấy các bản ghi mới nhất cho từng hồ bơi
    const latestRecords = getLatestRecordsPerPool(records, pools);
    
    for (const record of latestRecords) {
      // Kiểm tra pH
      if (record.phLevel < 7.2 || record.phLevel > 7.8) {
        alerts.push({
          id: `ph-${record.recordId}`,
          poolId: record.poolId,
          poolName: poolMap.get(record.poolId) || `Hồ bơi #${record.poolId}`,
          parameter: 'pH',
          value: record.phLevel,
          status: (record.phLevel < 6.8 || record.phLevel > 8.0 ? 'danger' : 'warning'),
          time: new Date(record.pTimestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
        });
      }
      
      // Kiểm tra clo
      if (record.chlorineLevel < 1.0 || record.chlorineLevel > 3.0) {
        alerts.push({
          id: `chlorine-${record.recordId}`,
          poolId: record.poolId,
          poolName: poolMap.get(record.poolId) || `Hồ bơi #${record.poolId}`,
          parameter: 'Clo',
          value: record.chlorineLevel,
          status: (record.chlorineLevel < 0.5 || record.chlorineLevel > 3.5 ? 'danger' : 'warning'),
          time: new Date(record.pTimestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
        });
      }
    }
    
    return alerts;
  };

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy danh sách hồ bơi
        const poolsResponse = await getAllPools();
        const poolsData = Array.isArray(poolsResponse?.data) ? poolsResponse.data : [];
        setPools(poolsData);
        
        // Tính toán số liệu thống kê hồ bơi
        setPoolStats({
          total: poolsData.length,
          active: poolsData.filter(pool => pool.status === 'active' || pool.status === 'Hoạt động').length,
          underMaintenance: poolsData.filter(pool => pool.status === 'maintenance' || pool.status === 'Bảo trì').length,
        });
        
        // Gọi API lấy dữ liệu chất lượng nước
        const recordsResponse = await getWaterQualityHistory();
        const recordsData = Array.isArray(recordsResponse?.data) ? recordsResponse.data : [];
        setQualityRecords(recordsData);
        
        // Lọc ra những bản ghi mới nhất cho mỗi hồ bơi (đo lường gần đây)
        const latestRecords = getLatestRecordsPerPool(recordsData, poolsData);
        setRecentMeasurements(latestRecords);
        
        // Lọc ra những cảnh báo về chất lượng nước
        const alerts = getQualityAlerts(recordsData, poolsData);
        setQualityAlerts(alerts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Không thể tải dữ liệu tổng quan!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  });

  // Hiển thị loading khi đang tải dữ liệu
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
            <span className="text-red-500 font-medium">
              {qualityAlerts.filter(a => a.status === 'danger').length} nghiêm trọng
            </span>
            {qualityAlerts.filter(a => a.status === 'warning').length > 0 && (
              <span className="ml-1 text-orange-500 font-medium">
                , {qualityAlerts.filter(a => a.status === 'warning').length} cảnh báo
              </span>
            )}
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
              {recentMeasurements.map((measurement, index) => (
                <tr key={`${measurement.parameterId || measurement.poolId}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {measurement.poolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      measurement.pHLevel < 7.2 || measurement.pHLevel > 7.8 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {measurement.pHLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      measurement.chlorineMgPerL < 1.0 || measurement.chlorineMgPerL > 3.0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {measurement.chlorineMgPerL}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {measurement.temperatureC}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(measurement.pTimestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
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
