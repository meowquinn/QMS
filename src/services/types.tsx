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