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

export interface Pool {
  poolsId: number;           // Đổi từ poolId sang poolsId để khớp với database
  poolName: string;          // Giữ nguyên - khớp với database
  size: number;              // Giữ nguyên - khớp với database
  maxCapacity: number;       // Đổi từ capacity sang maxCapacity
  depth: number;             // Giữ nguyên - khớp với database
  pLocation: string;         // Đổi từ location sang pLocation
  pStatus: string;           // Đổi từ status sang pStatus và kiểu dữ liệu đổi từ enum sang string
}