// Staff
export interface StaffMember {
  staffId: number;        // Đổi từ id thành staffId
  fullName: string;       // Đổi từ name thành fullName
  sRole: string;          // Đổi từ role thành sRole
  username: string;
  sPassword?: string;     // Đổi từ password thành sPassword, thêm optional vì thường không hiển thị
  phoneNumber: string;    // Đổi từ phone thành phoneNumber
  email: string;
  access: 'admin' | 'user';
  sAddress?: string;      // Đổi từ address thành sAddress, thêm optional
}
// Pool
export interface Pool {
  poolsId: number;           // Đổi từ poolId sang poolsId để khớp với database
  poolName: string;          // Giữ nguyên - khớp với database
  size: number;              // Giữ nguyên - khớp với database
  maxCapacity: number;       // Đổi từ capacity sang maxCapacity
  depth: number;             // Giữ nguyên - khớp với database
  pLocation: string;         // Đổi từ location sang pLocation
  pStatus: string;           // Đổi từ status sang pStatus và kiểu dữ liệu đổi từ enum sang string
}

// Water Quality
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

// Water Quality Form Data
export interface WaterParameterFormData {
  poolName: string;
  timestamp: Date | null;
  temperature: number | null;
  pH: number | null;
  chlorine: number | null;
  notes: string;
  resolved: boolean;
  needsAction: boolean;
}

// Water Quality Submit Data
export interface WaterQualitySubmitData {
  poolName: string;
  pTimestamp: Date;
  temperatureC: number;
  pHLevel: number;
  chlorineMgPerL: number;
  notes: string;
  createdBy?: number; 
  rStatus: string;
  resolved: boolean;
  needsAction: boolean;
}

// Water Quality Record
export interface WaterQualityRecord {
  poolId: number;
  parameterId: number;
  poolName: string;
  pTimestamp: Date;
  temperatureC: number;
  pHLevel: number;
  chlorineMgPerL: number;
  notes: string;
  createdBy?: number;
  rStatus: string;
  resolved: boolean;
  needsAction: boolean;
}

// Định nghĩa các kiểu dữ liệu
export interface Chemical {
  chemicalId: number;
  chemicalName: string;
  chemicalType: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  reorderLevel: number;
  chDescription?: string;
}

export interface AdjustmentRecord {
  chemicalId: number;
  chemicalName: string;
  action: string; // "Sử dụng" hoặc "Nạp thêm"
  poolId: number;
  poolName: string;
  quantity: number;
  unit: string;
  adjustedBy: number; // staffId
  note?: string;
}

export interface ChemicalUsageHistory {
  historyId: number;
  chemicalId: number;
  chemicalName: string;
  action: string; // "Sử dụng" hoặc "Nạp thêm"
  poolId: number;
  poolName: string;
  quantity: number;
  unit: string;
  adjustedBy: number; // staffId
  cTimestamp: Date; // Ngày giờ thực hiện
  note?: string;
}
