// src/services/staffService.ts
import api from './api';
import type { StaffMember } from './types';

export const getAllStaff = async () => {
  try {
    const response = await api.get('/Staff');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể lấy danh sách nhân viên');
  }
};

export const createStaff = async (staffData: Omit<StaffMember, 'id'>) => {
  try {
    const response = await api.post('/Staff', staffData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể tạo nhân viên mới');
  }
};

export const updateStaff = async (id: number, staffData: Partial<StaffMember>) => {
  try {
    const response = await api.put(`/Staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể cập nhật thông tin nhân viên');
  }
};

export const deleteStaff = async (id: number) => {
  try {
    const response = await api.delete(`/Staff/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể xóa nhân viên');
  }
};