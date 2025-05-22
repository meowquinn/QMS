export interface StaffMember {
  id: number;
  name: string;
  role: string;
  username: string;
  password: string;
  phone: string;
  email: string;
  access: 'admin' | 'user';
  address: string;
}