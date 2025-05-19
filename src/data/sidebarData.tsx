import React, { type JSX } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiDatabase, 
  FiBox, 
  FiActivity, 
  FiClipboard,
  FiFileText, 
} from 'react-icons/fi';

// Định nghĩa kiểu dữ liệu cho menu item
interface SubMenuItem {
  id: string;
  title: string;
  path: string;
  icon: JSX.Element;
}

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: JSX.Element;
  subItems?: SubMenuItem[];
  adminOnly?: boolean;
}

const sidebarMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Tổng quan',
    path: '/dashboard',
    icon: <FiHome className="w-4 h-4" />,
    adminOnly: false
  },
  {
    id: 'quality-tracking',
    title: 'Chất Lượng Nước',
    path: '/quality',
    icon: <FiActivity className="w-4 h-4" />,
    adminOnly: false,
    subItems: [
      {
        id: 'quality-parameters',
        title: 'Nhập chỉ số',
        path: '/quality/parameters',
        icon: <FiFileText className="w-4 h-4" />
      },
      {
        id: 'quality-records',
        title: 'Lịch sử đo',
        path: '/quality/records',
        icon: <FiClipboard className="w-4 h-4" />
      },
      
    ]
  },
  {
    id: 'pools',
    title: 'Hồ bơi',
    path: '/pools',
    icon: <FiBox className="w-4 h-4" />,
    adminOnly: false
  },
  {
    id: 'staff',
    title: 'Nhân viên',
    path: '/staff',
    icon: <FiUsers className="w-4 h-4" />,
    adminOnly: true // Chỉ admin mới thấy quản lý nhân viên
  },
  {
    id: 'inventory',
    title: 'Kho',
    path: '/inventory',
    icon: <FiDatabase className="w-4 h-4" />,
    adminOnly: false
  },
  
];

export default sidebarMenu;