// src/services/poolService.ts
import api from './api';
import type { Pool } from './types';

/**
 * Lấy danh sách tất cả hồ bơi
 */
export const getAllPools = async () => {
  try {
    const response = await api.get('/Pools');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể lấy danh sách hồ bơi');
  }
};

/**
 * Lấy thông tin chi tiết của một hồ bơi theo ID
 */

/**
 * Tạo hồ bơi mới
 */
export const createPool = async (poolData: Omit<Pool, 'poolId'>) => {
  try {
    const response = await api.post('/Pools', poolData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể tạo hồ bơi mới');
  }
};

/**
 * Cập nhật thông tin hồ bơi
 */
export const updatePool = async (poolId: number, poolData: Partial<Pool>) => {
  try {
    const response = await api.put(`/Pools/${poolId}`, poolData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể cập nhật thông tin hồ bơi');
  }
};

/**
 * Xóa hồ bơi
 */
export const deletePool = async (poolId: number) => {
  try {
    const response = await api.delete(`/Pools/${poolId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể xóa hồ bơi');
  }
};

/**
 * Cập nhật trạng thái của hồ bơi (active, maintenance, closed)
 */
export const updatePoolStatus = async (poolId: number, status: 'active' | 'maintenance' | 'closed') => {
  try {
    const response = await api.patch(`/Pools/${poolId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Không thể cập nhật trạng thái hồ bơi');
  }
};