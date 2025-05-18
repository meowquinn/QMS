import { type JSX } from 'react';
import { VscDashboard, VscBeaker } from "react-icons/vsc";
import { PiUsersThree } from "react-icons/pi";

import {  
  FaSwimmingPool, FaWarehouse,
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
  },
  {
    id: 'inventory',
    title: 'QUẢN LÝ KHO',
    path: '/inventory',
    icon: <FaWarehouse className="mr-4 h-5 w-5" />,
  },
];

export default sidebarMenu;
