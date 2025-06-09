import api from './api';

// Lấy dữ liệu tổng quan cho Dashboard
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: null };
  }
};

// Lấy danh sách cảnh báo chất lượng nước mới nhất
export const getQualityAlerts = async () => {
  try {
    const response = await api.get('/dashboard/quality-alerts');
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

// Lấy danh sách các phép đo mới nhất cho mỗi hồ bơi
export const getLatestMeasurements = async () => {
  try {
    const response = await api.get('/dashboard/latest-measurements');
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};