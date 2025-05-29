import api from './api';

// Cập nhật interface theo đúng cấu trúc bảng WaterQualityParameters
export interface WaterQualityParameter {
  parameterId?: number; // Tự động tăng trong DB
  poolId: number; // Thay đổi từ string sang number
  poolName: string;
  pTimestamp: Date; // Đổi từ timestamp sang pTimestamp
  temperatureC: number; // Đổi từ temperatureValue sang temperatureC
  pHLevel: number; // Đổi từ pHValue sang pHLevel
  chlorineMgPerL: number; // Đổi từ chlorineValue sang chlorineMgPerL
  notes: string;
  createdAt?: Date; // Thêm trường mới, optional vì sẽ tự động tạo trong DB
  createdById?: number; // Thêm trường mới, optional vì có thể null
  status?: 'normal' | 'warning' | 'critical';
  resolved?: boolean;
  needsAction?: boolean;
}

/**
 * Thêm một bản ghi đo chất lượng nước mới
 */
export const addWaterQualityParameter = async (parameterData: Omit<WaterQualityParameter, 'parameterId' | 'createdAt'>) => {
  try {
    // Gửi pTimestamp dưới dạng chuỗi ISO để API xử lý
    const dataToSend = {
      ...parameterData,
      pTimestamp: parameterData.pTimestamp.toISOString()
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
  poolId?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: number;
}) => {
  try {
    // Xây dựng query parameters
    const params: Record<string, string> = {};
    if (filters?.poolId) params.poolId = filters.poolId.toString();
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
        createdAt: reading.createdAt ? new Date(reading.createdAt) : undefined,
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