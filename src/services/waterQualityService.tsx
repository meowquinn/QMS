import api from './api';
import type { WaterQualityParameter } from './types';

/**
 * Thêm một bản ghi đo chất lượng nước mới
 */
export const addWaterQualityParameter = async (parameterData: Omit<WaterQualityParameter, 'parameterId' | 'createdAt'>) => {
  try {
    // Định dạng pTimestamp thành local string 'YYYY-MM-DDTHH:mm:ss'
    const d = parameterData.pTimestamp;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const dataToSend = {
      ...parameterData,
      pTimestamp: localString, // Gửi local time thay vì UTC
      createdBy: parameterData.createdBy // staffId
    };
    
    const response = await api.post('WaterQualityParameters', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Không thể thêm bản ghi chất lượng nước:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử đo chất lượng nước
 */
export const getWaterQualityHistory = async (filters?: {
  poolName?: string;
  startDate?: Date;
  endDate?: Date;
  createdById?: number;
}) => {
  try {
    // Xây dựng query parameters
    const params: Record<string, string> = {};
    if (filters?.poolName) params.poolName = filters.poolName;
    if (filters?.startDate) params.startDate = filters.startDate.toISOString();
    if (filters?.endDate) params.endDate = filters.endDate.toISOString();
    if (filters?.createdById) params.createdById = filters.createdById.toString();
    
    const response = await api.get('/WaterQualityParameters', { params });
    
    // Chuyển đổi chuỗi timestamp thành đối tượng Date và thêm các trường status, resolved, needsAction
    const readings = response.data.map((reading: WaterQualityParameter) => {
      // Tính toán trạng thái dựa trên thông số
      const isPhNormal = reading.pHLevel >= 7.0 && reading.pHLevel <= 7.6;
      const isChlorineNormal = reading.chlorineMgPerL >= 0.5 && reading.chlorineMgPerL <= 3.0;

      let rStatus: 'normal' | 'warning' | 'critical' = 'normal';

      // Điều kiện critical
      if (
        reading.pHLevel < 6.5 || reading.pHLevel > 8.0 ||
        reading.chlorineMgPerL < 0.2 || reading.chlorineMgPerL > 5.0
      ) {
        rStatus = 'critical';
      } else if (!isPhNormal || !isChlorineNormal) {
        rStatus = 'warning';
      }

      return {
        ...reading,
        pTimestamp: new Date(reading.pTimestamp),
        rStatus,
        resolved: reading.resolved,
        needsAction: !reading.resolved && rStatus !== 'normal'
      };
    });
    
    return readings;
  } catch (error) {
    console.error('Không thể lấy lịch sử đo chất lượng nước:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một bản ghi đo
 */
export const getWaterQualityDetail = async (parameterId: number) => {
  try {
    const response = await api.get(`/WaterQualityParameters/${parameterId}`);
    
    // Chuyển đổi chuỗi timestamp thành đối tượng Date
    const reading = {
      ...response.data,
      pTimestamp: new Date(response.data.pTimestamp),
      createdAt: new Date(response.data.createdAt)
    };
    
    return reading;
  } catch (error) {
    console.error(`Không thể lấy thông tin chi tiết của bản ghi ${parameterId}:`, error);
    throw error;
  }
};


/**
 * Cập nhật trạng thái đã xử lý cho bản ghi
 */
export const updateWaterQualityResolved = async (
  parameterId: number, 
  data: {
    resolved: boolean;
    resolvedBy?: number;
    note?: string;
  }
) => {
  try {
    const response = await api.patch(`/WaterQualityParameters/${parameterId}/resolve`, data);
    return response.data;
  } catch (error) {
    console.error('Không thể cập nhật trạng thái đã xử lý cho bản ghi:', error);
    throw error;
  }
};