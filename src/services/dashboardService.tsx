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
