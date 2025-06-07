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

// Nạp thêm hóa chất
export const restockChemical = async (data: {
  chemicalId: number;
  quantity: number;
}) => {
  return api.post(`/chemicals/${data.chemicalId}/restock`, { quantity: data.quantity });
};

// Sử dụng hóa chất (ghi vào lịch sử)
export const applyChemical = async (data: Omit<AdjustmentRecord, 'historyId' | 'cTimestamp'>) => {
  return api.post('/chemicalUsageHistory', data);
};

// Sử dụng nhiều hóa chất cho một lần xử lý
export const applyMultipleChemicalsForPool = async (
  data: {
    chemicals: Array<{
      chemicalId: number;
      quantity: number;
    }>;
  }
) => {
  return api.patch('/Chemicals/batch/applychemical', data);
};

// Lấy danh sách hóa chất
export const getAllChemicals = async () => {
  return api.get('/chemicals');
};

// Lấy lịch sử điều chỉnh hóa chất
export const getChemicalHistory = async () => {
  return api.get('/chemicalUsageHistory');
};

// Tạo lịch sử sử dụng hóa chất
export const createChemicalUsageHistory = async (data: Omit<AdjustmentRecord, 'historyId' | 'cTimestamp'>) => {
  return api.post('/chemicalUsageHistory', data);
};

// Lấy danh sách hồ bơi
export const getAllPools = async () => {
  return api.get('/Pools');
};

// Cập nhật thông tin hóa chất
export const updateChemical = async (chemical: Chemical) => {
  return api.put(`/chemicals/${chemical.chemicalId}`, chemical);
};