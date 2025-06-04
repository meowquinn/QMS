import api from './api';

// Cập nhật interface theo đúng cấu trúc bảng WaterQualityParameters
export interface WaterQualityParameter {
  parameterId: number;
  poolName: string;
  pTimestamp: Date;
  temperatureC: number;
  pHLevel: number;
  chlorineMgPerL: number;
  notes: string;
  createdBy?: number; // staffId
  rStatus: string;
  resolved: boolean;
  needsAction: boolean;
}

// Khi gọi hàm addWaterQualityParameter:
// const waterQualityData = {
//   poolName: selectedPool.poolName,
//   pTimestamp: formData.timestamp as Date,
//   temperatureC: formData.temperature as number,
//   pHLevel: formData.pH as number,
//   chlorineMgPerL: formData.chlorine as number,
//   notes: formData.notes,
//   // ...các trường khác nếu cần
// };

// await addWaterQualityParameter(waterQualityData);

/**
 * Thêm một bản ghi đo chất lượng nước mới
 */
export const addWaterQualityParameter = async (parameterData: Omit<WaterQualityParameter, 'parameterId' | 'createdAt'>) => {
  try {
    // Gửi pTimestamp dưới dạng chuỗi ISO để API xử lý
    const dataToSend = {
      ...parameterData,
      pTimestamp: parameterData.pTimestamp.toISOString(),
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
      
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      if (!isPhNormal || !isChlorineNormal) {
        status = 'warning';
      }
      
      return {
        ...reading,
        pTimestamp: new Date(reading.pTimestamp),
        status,
        resolved: status === 'normal',
        needsAction: status !== 'normal'
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
 * Cập nhật ghi chú cho bản ghi
 */
export const updateWaterQualityNotes = async (parameterId: number, notes: string) => {
  try {
    const response = await api.patch(`/WaterQualityParameters/${parameterId}/notes`, {
      notes
    });
    return response.data;
  } catch (error) {
    console.error('Không thể cập nhật ghi chú cho bản ghi:', error);
    throw error;
  }
};