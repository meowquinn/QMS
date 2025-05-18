import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { VscChevronRight, VscChevronDown } from "react-icons/vsc";
import sidebarMenu from '../../../data/sidebarData';

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle, isMobile, isOpen, onClose }) => {
  const location = useLocation();
  // State để quản lý trạng thái đóng/mở của menu con
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'quality-tracking': false,
    'treatment-process': false,
    'master-data': false,
    'pools': false,
    'staff': false,
    'inventory': false,
    'reports': false,
  });
  
  // State để quản lý item có dropdown đang hiển thị (khi sidebar thu gọn)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Ref để kiểm tra click bên ngoài dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State để quản lý trạng thái đóng/mở của sidebar - chỉ dùng trong desktop mode
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Effect để thông báo trạng thái đóng/mở lên component cha
  useEffect(() => {
    if (onToggle && !isMobile) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle, isMobile]);

  // Effect để tự động mở submenu khi đường dẫn hiện tại nằm trong submenu
  useEffect(() => {
    // Kiểm tra các menu xem có submenu nào chứa đường dẫn hiện tại không
    sidebarMenu.forEach(item => {
      if (item.subItems && item.subItems.some(subItem => location.pathname.startsWith(subItem.path))) {
        setOpenSubMenus(prev => ({
          ...prev,
          [item.id]: true
        }));
      }
    });
  }, [location.pathname]);

  // Effect để đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm xử lý đóng/mở menu con
  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Hàm toggle đóng/mở sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Hàm xử lý khi click vào menu item trong chế độ thu gọn
  const handleCollapsedMenuClick = (event: React.MouseEvent, id: string) => {
    // Nếu menu không có submenu, chỉ cần chuyển hướng thông thường
    const menuItem = sidebarMenu.find(item => item.id === id);
    if (!menuItem?.subItems || menuItem.subItems.length === 0) return;
    
    // Ngăn chặn chuyển hướng mặc định
    event.preventDefault();
    
    // Toggle dropdown
    setActiveDropdown(prev => prev === id ? null : id);
  };

  // Kiểm tra xem menu item hiện tại có đang được active không
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Kiểm tra xem menu item có chứa submenu active không
  const hasActiveSubmenu = (item: typeof sidebarMenu[0]) => {
    if (!item.subItems) return false;
    return item.subItems.some(subItem => location.pathname.startsWith(subItem.path));
  };

  // Đóng sidebar khi click bên ngoài (chỉ cho mobile)
  const handleOverlayClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay khi mở sidebar trên mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={handleOverlayClick}
        ></div>
      )}

      <aside 
        className={`bg-white text-gray-500 min-h-screen h-screen fixed flex flex-col shadow-lg transition-all duration-300 
        ${isMobile 
          ? `z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64` 
          : `z-10 ${isCollapsed ? 'w-20' : 'w-64'}`
        }`}
      >
        {/* Header - cố định ở trên */}
        <div className="p-5 flex-shrink-0">
          {/* Tiêu đề có thể click để đóng/mở sidebar */}
          <div 
            onClick={toggleSidebar}
            className="cursor-pointer transition-colors hover:text-blue-500"
          >
            {(!isCollapsed || isMobile) ? (
              <h1 className="text-2xl font-bold">AquaMonitor</h1>
            ) : (
              <h1 className="text-xl font-bold text-center">AQ</h1>
            )}
          </div>
        </div>

        {/* Menu chính */}
        <div 
          className="flex-1 overflow-y-auto px-5 max-h-[calc(100vh-130px)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(209 213 219) rgb(243 244 246)',
            msOverflowStyle: '-ms-autohiding-scrollbar',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <nav>
            <ul>
              {sidebarMenu.map((item) => (
                <li key={item.id} className="mb-1 relative">
                  {item.subItems && (!isCollapsed || isMobile) ? (
                    <div>
                      <button
                        className={`items-center text-left font-medium text-xs flex transition-all w-full p-2 rounded-3xl hover:bg-[#F2F2F2] hover:text-blue-600 ${
                          location.pathname.startsWith(item.path) || hasActiveSubmenu(item) 
                            ? 'bg-[#F2F2F2] font-bold text-blue-600' 
                            : 'text-gray-500'
                        }`}
                        onClick={() => toggleSubMenu(item.id)}
                      >
                        {item.icon}
                        <span className="flex-1 ml-2">{item.title}</span>
                        {openSubMenus[item.id] ? (
                          <VscChevronDown className="h-3 w-4" />
                        ) : (
                          <VscChevronRight className="h-3 w-4" />
                        )}
                      </button>
                      {openSubMenus[item.id] && (
                        <ul className="pl-6 mt-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <Link
                                to={subItem.path}
                                className={`flex font-normal w-full items-center p-2 text-xs rounded-3xl hover:bg-[#F2F2F2] hover:text-blue-600 ${
                                  isActive(subItem.path) 
                                    ? 'bg-[#F2F2F2] font-bold text-blue-600' 
                                    : 'text-gray-500'
                                }`}
                                onClick={isMobile ? onClose : undefined}
                              >
                                {subItem.icon}
                                <span className="ml-2">{subItem.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        to={item.subItems && isCollapsed && !isMobile ? '#' : item.path}
                        className={`flex text-xs font-medium ${isCollapsed && !isMobile ? 'justify-center' : 'items-center'} p-2 rounded-3xl hover:bg-[#F2F2F2] hover:text-blue-600 ${
                          isActive(item.path) || (item.subItems && hasActiveSubmenu(item)) 
                            ? 'bg-[#F2F2F2] font-bold text-blue-600' 
                            : 'text-gray-500'
                        }`}
                        title={isCollapsed && !isMobile ? item.title : ''}
                        onClick={(e) => {
                          if (isCollapsed && !isMobile && item.subItems) {
                            handleCollapsedMenuClick(e, item.id);
                          } else if (isMobile) {
                            if (onClose) onClose();
                          }
                        }}
                      >
                        {isCollapsed && !isMobile
                          ? React.cloneElement(item.icon, { 
                              className: `h-6 w-6 ${(isActive(item.path) || (item.subItems && hasActiveSubmenu(item))) ? 'text-blue-600' : 'text-gray-500'}` 
                            })
                          : item.icon
                        }
                        {(!isCollapsed || isMobile) && <span className="ml-2">{item.title}</span>}
                      </Link>
                      
                      {/* Dropdown menu khi sidebar thu gọn và nhấn vào icon */}
                      {isCollapsed && !isMobile && activeDropdown === item.id && item.subItems && (
                        <div 
                          ref={dropdownRef}
                          className="absolute left-full top-0 ml-1 bg-white rounded-md shadow-lg p-2 w-48 z-50 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
                          style={{ 
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgb(209 213 219) rgb(243 244 246)',
                            msOverflowStyle: '-ms-autohiding-scrollbar',
                            WebkitOverflowScrolling: 'touch'
                          }}
                        >
                          <div className="text-xs font-bold p-2 border-b border-gray-200 mb-1">
                            {item.title}
                          </div>
                          <ul>
                            {item.subItems.map(subItem => (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center p-2 text-xs rounded-md hover:bg-gray-100 ${
                                    isActive(subItem.path) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
                                  }`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {subItem.icon}
                                  <span className="ml-2">{subItem.title}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Footer của sidebar - cố định ở dưới */}
        <div className="p-3 text-xs text-center text-gray-500 border-t border-gray-200 flex-shrink-0">
          {(!isCollapsed || isMobile) ? <p>AquaMonitor v1.0</p> : <p>v1.0</p>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
