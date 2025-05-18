import { type JSX } from 'react';
import { VscDashboard, VscBeaker, VscTools  } from "react-icons/vsc";
import { BsClipboard2Data } from "react-icons/bs";
import { PiUsersThree } from "react-icons/pi";

import {  
  FaSwimmingPool, FaWarehouse, FaChartBar,
} from 'react-icons/fa';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: JSX.Element;
  subItems?: MenuItem[];
}

const sidebarMenu: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'TỔNG QUAN',
    path: '/dashboard',
    icon: <VscDashboard className="mr-4 h-5 w-5" />,
  },
  {
    id: 'quality-tracking',
    title: 'THEO DÕI CHẤT LƯỢNG',
    path: '/quality-tracking',
    icon: <VscBeaker className="mr-4 h-5 w-5" />,
    subItems: [
      {
        id: 'water-parameters',
        title: 'Đo chỉ số nước',
        path: '/quality-tracking/parameters',
        icon: <></>,
      },
      {
        id: 'quality-alerts',
        title: 'Cảnh báo',
        path: '/quality-tracking/alerts',
        icon: <></>,
      },
    ],
  },
  {
    id: 'treatment-process',
    title: 'QUY TRÌNH XỬ LÝ',
    path: '/treatment-process',
    icon: <VscTools className="mr-4 h-5 w-5" />,
    subItems: [
      {
        id: 'balance-concentration',
        title: 'Cân bằng nồng độ',
        path: '/treatment-process/balance',
        icon: <></>,
      },
      {
        id: 'maintenance',
        title: 'Bảo trì',
        path: '/treatment-process/maintenance',
        icon: <></>,
      },
    ],
  },
  {
    id: 'master-data',
    title: 'DỮ LIỆU CHỦ',
    path: '/master-data',
    icon: <BsClipboard2Data className="h-5 w-5 mr-4" />,
    subItems: [
      {
        id: 'chemicals',
        title: 'Hóa chất',
        path: '/master-data/chemicals',
        icon: <></>,
      },
      {
        id: 'parameters',
        title: 'Tham số',
        path: '/master-data/parameters',
        icon: <></>,
      },
    ],
  },
  {
    id: 'pools',
    title: 'THÔNG TIN HỒ BƠI',
    path: '/pools',
    icon: <FaSwimmingPool className="mr-4 h-5 w-5" />,
  },
  {
    id: 'staff',
    title: 'NHÂN VIÊN',
    path: '/staff',
    icon: <PiUsersThree className="mr-4 h-5 w-5" />,
    subItems: [
      {
        id: 'staff-list',
        title: 'Danh sách nhân viên',
        path: '/staff/list',
        icon: <></>,
      },
      {
        id: 'access-control',
        title: 'Phân quyền truy cập',
        path: '/staff/access-control',
        icon: <></>,
      },
    ],
  },
  {
    id: 'inventory',
    title: 'QUẢN LÝ KHO',
    path: '/inventory',
    icon: <FaWarehouse className="mr-4 h-5 w-5" />,
    subItems: [
      {
        id: 'inventory-in',
        title: 'Nhập kho',
        path: '/inventory/in',
        icon: <></>,
      },
      {
        id: 'inventory-out',
        title: 'Xuất kho',
        path: '/inventory/out',
        icon: <></>,
      },
      {
        id: 'inventory-stock',
        title: 'Tồn kho',
        path: '/inventory/stock',
        icon: <></>,
      },
    ],
  },
  {
    id: 'reports',
    title: 'BÁO CÁO',
    path: '/reports',
    icon: <FaChartBar className="mr-4 h-5 w-5" />,
    subItems: [
      {
        id: 'pool-list-report',
        title: 'Danh sách hồ bơi',
        path: '/reports/pool-list',
        icon: <></>,
      },
      {
        id: 'daily-water-quality',
        title: 'Chất lượng nước hàng ngày',
        path: '/reports/daily-water-quality',
        icon: <></>,
      },
      {
        id: 'chemical-usage',
        title: 'Hóa chất tiêu thụ',
        path: '/reports/chemical-usage',
        icon: <></>,
      },
    ],
  },
];

export default sidebarMenu;
