import api from './api';
import type { Chemical, AdjustmentRecord } from './types';

// Thêm hóa chất mới
export const addChemical = async (chemical: Omit<Chemical, 'chemicalId'>) => {
  return api.post('/chemicals', chemical);
};

// Xóa hóa chất
export const deleteChemical = async (chemicalId: number) => {
  return api.delete(`/chemicals/${chemicalId}`);
};

// Nạp thêm hóa chất (ghi vào lịch sử)
export const restockChemical = async (data: Omit<AdjustmentRecord, 'historyId' | 'cTimestamp'>) => {
  return api.post('/chemicalUsageHistory', data);
};

// Sử dụng hóa chất (ghi vào lịch sử) - ĐỔI TÊN để tránh lỗi ESLint
export const applyChemical = async (data: Omit<AdjustmentRecord, 'historyId' | 'cTimestamp'>) => {
  return api.post('/chemicalUsageHistory', data);
};

// Lấy danh sách hóa chất
export const getAllChemicals = async () => {
  return api.get('/chemicals');
};

// Lấy lịch sử điều chỉnh hóa chất
export const getChemicalHistory = async () => {
  return api.get('/chemicalUsageHistory');
};