import api from './api';
// Import types từ file types.tsx
import type { Pool, WaterQualityRecord } from './types';

// Interface cho dữ liệu tổng quan
export interface DashboardSummary {
  totalPools: number;
  activePools: number;
  maintenancePools: number;
  closedPools: number;
  totalAlerts?: number;
  criticalAlerts?: number;
  warningAlerts?: number;
  todayMeasurements?: number;
}

/**
 * Lấy dữ liệu tổng quan cho Dashboard
 */
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error(error);
    
    // Tính toán dữ liệu tổng quan từ các API khác
    try {
      const [poolsRes, recordsRes] = await Promise.all([
        api.get('/pools'),
        api.get('/waterquality')
      ]);
      
      const poolsData = (poolsRes?.data?.data || []) as Pool[];
      const recordsData = (recordsRes?.data?.data || []) as WaterQualityRecord[];
      
      // Sử dụng dữ liệu từ API để tính toán
      const stats = calculateDashboardStats(poolsData, recordsData);
      
      return {
        success: true,
        data: stats
      };
    } catch (innerError) {
      console.error("Fallback calculation failed:", innerError);
      
      // Nếu tất cả đều thất bại, trả về dữ liệu mẫu
      console.warn("Dashboard API not available, using mock data");
    }
  }
};

/**
 * Lấy danh sách cảnh báo chất lượng nước mới nhất
 */
export const getQualityAlerts = async () => {
  try {
    const response = await api.get('/dashboard/quality-alerts');
    return response.data;
  } catch (error) {
    console.error(error);
    
    // Thử tính toán cảnh báo từ dữ liệu chất lượng nước
    try {
      const [poolsRes, recordsRes] = await Promise.all([
        api.get('/pools'),
        api.get('/waterquality')
      ]);
      
      const poolsData = (poolsRes?.data?.data || []) as Pool[];
      const recordsData = (recordsRes?.data?.data || []) as WaterQualityRecord[];
      
      // Chỉ lấy bản ghi mới nhất cho mỗi hồ
      const alerts = getQualityAlertsFromRecords(recordsData, poolsData);
      
      return {
        success: true,
        data: alerts
      };
    } catch (innerError) {
      console.error("Failed to calculate alerts from water quality records:", innerError);
      return { success: false, message: "API not available" };
    }
  }
};

/**
 * Lấy danh sách các phép đo mới nhất cho mỗi hồ bơi
 */
export const getLatestMeasurements = async () => {
  try {
    const response = await api.get('/dashboard/latest-measurements');
    return response.data;
  } catch (error) {
    console.error(error);
    
    // Thử lấy bản ghi từ API chất lượng nước
    try {
      const [poolsRes, recordsRes] = await Promise.all([
        api.get('/pools'),
        api.get('/waterquality')
      ]);
      
      const poolsData = (poolsRes?.data?.data || []) as Pool[];
      const recordsData = (recordsRes?.data?.data || []) as WaterQualityRecord[];
      
      // Lấy 5 bản ghi mới nhất
      const latestRecords = getLatestRecordsFromAll(recordsData, poolsData).slice(0, 5);
      
      return {
        success: true,
        data: latestRecords
      };
    } catch (innerError) {
      console.error("Failed to get latest measurements:", innerError);
      return { success: false, message: "API not available" };
    }
  }
};

/**
 * Hàm lấy ra 5 bản ghi đo lường gần đây nhất
 */
export const getLatestRecordsFromAll = (records: WaterQualityRecord[] = [], pools: Pool[] = []): WaterQualityRecord[] => {
  const poolMap = new Map<number | string, string>();
  
  // Tạo map để ánh xạ poolsId với tên hồ bơi
  pools.forEach(pool => {
    const id = pool.poolsId;
    if (id) poolMap.set(id, pool.poolName || '');
  });
  
  // Sắp xếp theo thời gian mới nhất trước
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.pTimestamp || a.pTimestamp || '');
    const dateB = new Date(b.pTimestamp || b.pTimestamp || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Thêm tên hồ bơi vào mỗi bản ghi
  sortedRecords.forEach(record => {
    const id = record.poolId;
    if (id) {
      record.poolName = poolMap.get(id) || `Hồ bơi #${id}`;
    }
  });
  
  // Trả về 5 bản ghi mới nhất
  return sortedRecords.slice(0, 5);
};

/**
 * Định nghĩa interface cho các cảnh báo
 */
interface QualityAlert {
  id: string;
  poolId: number | string;
  poolName: string;
  parameter: string;
  value: number;
  status: 'danger' | 'warning';
  time: string;
}

/**
 * Hàm lọc ra các cảnh báo chất lượng nước từ dữ liệu đo lường
 */
export const getQualityAlertsFromRecords = (records: WaterQualityRecord[] = [], pools: Pool[] = []): QualityAlert[] => {
  const poolMap = new Map<number | string, string>();
  
  // Tạo map để ánh xạ poolId với tên hồ bơi
  pools.forEach(pool => {
    const id = pool.poolsId;
    if (id) poolMap.set(id, pool.poolName || '');
  });
  
  // Lọc ra bản ghi mới nhất cho mỗi hồ bơi
  const latestPerPool = new Map<number | string, WaterQualityRecord>();
  
  // Sắp xếp theo thời gian mới nhất
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.pTimestamp || a.pTimestamp || '');
    const dateB = new Date(b.pTimestamp || b.pTimestamp || '');
    return dateB.getTime() - dateA.getTime();
  });
  
  // Lấy bản ghi mới nhất cho mỗi hồ
  sortedRecords.forEach(record => {
    const poolId = record.poolId;
    if (poolId && !latestPerPool.has(poolId)) {
      latestPerPool.set(poolId, record);
    }
  });
  
  // Tạo danh sách cảnh báo từ các bản ghi mới nhất
  const alerts: QualityAlert[] = [];
  const latestRecords = Array.from(latestPerPool.values());
  
  latestRecords.forEach(record => {
    const poolId = record.poolId;
    if (!poolId) return;
    
    const poolName = poolMap.get(poolId) || `Hồ bơi #${poolId}`;
    const timestamp = record.pTimestamp || record.pTimestamp || '';
    const phValue = record.pHLevel || record.pHLevel;
    const chlorineValue = record.chlorineMgPerL || record.chlorineLevel;
    
    // Kiểm tra pH
    if (phValue !== undefined && (phValue < 7.2 || phValue > 7.8)) {
      alerts.push({
        id: `ph-${record.parameterId || Math.random()}`,
        poolId,
        poolName,
        parameter: 'pH',
        value: phValue,
        status: phValue < 6.8 || phValue > 8.0 ? 'danger' : 'warning',
        time: new Date(timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
      });
    }
    
    // Kiểm tra clo
    if (chlorineValue !== undefined && (chlorineValue < 1.0 || chlorineValue > 3.0)) {
      alerts.push({
        id: `chlorine-${record.parameterId || Math.random()}`,
        poolId,
        poolName,
        parameter: 'Clo',
        value: chlorineValue,
        status: chlorineValue < 0.5 || chlorineValue > 3.5 ? 'danger' : 'warning',
        time: new Date(timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
      });
    }
  });
  
  return alerts;
};

/**
 * Tính toán số liệu tổng quan từ dữ liệu hồ bơi và chất lượng nước
 */
export const calculateDashboardStats = (pools: Pool[] = [], qualityRecords: WaterQualityRecord[] = []): DashboardSummary => {
  // Tính toán thống kê hồ bơi
  const totalPools = pools.length;
  const activePools = pools.filter(p => p.pStatus === 'active' || p.pStatus === 'Hoạt động').length;
  const maintenancePools = pools.filter(p => p.pStatus === 'maintenance' || p.pStatus === 'Bảo trì').length;
  const closedPools = totalPools - activePools - maintenancePools;
  
  // Lọc ra các bản ghi hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMeasurements = qualityRecords.filter(record => {
    if (!record.pTimestamp && !record.pTimestamp) return false;
    const recordDate = new Date(record.pTimestamp || record.pTimestamp || '');
    return recordDate >= today;
  }).length;
  
  // Lấy cảnh báo từ records
  const alerts = getQualityAlertsFromRecords(qualityRecords, pools);
  
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(alert => alert.status === 'danger').length;
  const warningAlerts = totalAlerts - criticalAlerts;
  
  return {
    totalPools,
    activePools,
    maintenancePools,
    closedPools,
    totalAlerts,
    criticalAlerts,
    warningAlerts,
    todayMeasurements
  };
};