import api from './api';

// Interface cho dữ liệu tổng quan
export interface DashboardSummary {
  totalPools: number;
  activePools: number;
  maintenancePools: number;
  closedPools: number;
  totalAlerts?: number;
  dangerAlerts?: number;
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
    // Nếu API chưa được triển khai, trả về dữ liệu mẫu
    console.warn("Dashboard API not available, using mock data");
    
    return {
      success: true,
      data: {
        totalPools: 4,
        activePools: 2,
        maintenancePools: 1,
        closedPools: 1,
        totalAlerts: 3,
        dangerAlerts: 1,
        warningAlerts: 2,
        todayMeasurements: 8
      }
    };
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
    console.warn("Quality alerts API not available, using derived data from water quality records");
    return { success: false, message: "API not available" };
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
    console.warn("Latest measurements API not available, using derived data from water quality records");
    return { success: false, message: "API not available" };
  }
};

/**
 * Tính toán số liệu tổng quan từ dữ liệu hồ bơi và chất lượng nước
 */
export const calculateDashboardStats = (pools: { status: string; poolId: string }[] = [], qualityRecords: { cTimestamp: string; poolId: string; phLevel: number; chlorineLevel: number }[] = []) => {
  // Tính toán thống kê hồ bơi
  const totalPools = pools.length;
  const activePools = pools.filter(p => p.status === 'active' || p.status === 'Hoạt động').length;
  const maintenancePools = pools.filter(p => p.status === 'maintenance' || p.status === 'Bảo trì').length;
  const closedPools = totalPools - activePools - maintenancePools;
  
  // Lọc ra các bản ghi hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMeasurements = qualityRecords.filter(record => 
    new Date(record.cTimestamp) >= today
  ).length;
  
  // Đếm cảnh báo
  interface Alert {
    parameter: string;
    status: 'warning' | 'danger';
  }
  const alerts: Alert[] = [];
  
  // Map để lưu bản ghi mới nhất cho mỗi hồ bơi
  const latestPerPool = new Map();
  
  // Sắp xếp các bản ghi theo thời gian giảm dần
  const sortedRecords = [...qualityRecords].sort((a, b) => 
    new Date(b.cTimestamp).getTime() - new Date(a.cTimestamp).getTime()
  );
  
  // Lọc ra bản ghi mới nhất cho mỗi hồ bơi
  sortedRecords.forEach(record => {
    if (!latestPerPool.has(record.poolId)) {
      latestPerPool.set(record.poolId, record);
      
      // Kiểm tra pH
      if (record.phLevel < 7.2 || record.phLevel > 7.8) {
        alerts.push({
          parameter: 'pH',
          status: record.phLevel < 6.8 || record.phLevel > 8.0 ? 'danger' : 'warning'
        });
      }
      
      // Kiểm tra clo
      if (record.chlorineLevel < 1.0 || record.chlorineLevel > 3.0) {
        alerts.push({
          parameter: 'Clo',
          status: record.chlorineLevel < 0.5 || record.chlorineLevel > 3.5 ? 'danger' : 'warning'
        });
      }
    }
  });
  
  const totalAlerts = alerts.length;
  const dangerAlerts = alerts.filter(alert => alert.status === 'danger').length;
  const warningAlerts = totalAlerts - dangerAlerts;
  
  return {
    totalPools,
    activePools,
    maintenancePools,
    closedPools,
    totalAlerts,
    dangerAlerts,
    warningAlerts,
    todayMeasurements
  };
};