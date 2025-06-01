import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { VscChevronRight, VscChevronDown } from 'react-icons/vsc';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { Tooltip } from 'antd'; // Thêm Tooltip
import sidebarMenu from '../../../data/sidebarData';
import { useAuth } from '../../../contexts/AuthContext'; // Thêm hook useAuth

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onToggle,
  isMobile,
  isOpen,
  onClose,
  onLogout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout: authLogout } = useAuth(); // Lấy user từ AuthContext

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sử dụng dữ liệu từ context hoặc fallback
  const userData = user || {
    fullName: 'Chưa đăng nhập',
    sRole: 'Không có quyền',
    email: '',
    phoneNumber: ''
  };

  useEffect(() => {
    if (onToggle && !isMobile) onToggle(isCollapsed);
  }, [isCollapsed, isMobile, onToggle]);

  useEffect(() => {
    sidebarMenu.forEach(item => {
      if (item.subItems?.some(sub => location.pathname.startsWith(sub.path))) {
        setOpenSubMenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  const handleCollapsedMenuClick = (e: React.MouseEvent, id: string) => {
    const menuItem = sidebarMenu.find(item => item.id === id);
    if (!menuItem?.subItems?.length) return;
    e.preventDefault();
    setActiveDropdown(prev => (prev === id ? null : id));
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const hasActiveSubmenu = (item: typeof sidebarMenu[0]) =>
    item.subItems?.some(sub => location.pathname.startsWith(sub.path));

  const handleOverlayClick = () => isMobile && onClose?.();

  // Cập nhật hàm handleLogout để sử dụng authLogout từ context
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (authLogout) {
      authLogout();
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <>
      {/* Phần code sẵn có */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={handleOverlayClick}></div>
      )}

      <aside
        className={`bg-white text-gray-500 min-h-screen fixed flex flex-col shadow-lg transition-all duration-300
        ${isMobile ? `z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64` : `z-10 ${isCollapsed ? 'w-20' : 'w-64'}`}`}
      >
        <div className="p-5">
          <div onClick={toggleSidebar} className="cursor-pointer hover:text-blue-500">
            <h1 className="text-xl font-bold text-center">{!isCollapsed || isMobile ? 'PoolQMS' : 'PQ'}</h1>
          </div>
        </div>

        {/* Phần menu giữ nguyên */}
        <div className="flex-1 overflow-y-auto px-5 max-h-[calc(100vh-130px)] custom-scrollbar">
          <nav>
            <ul>
              {sidebarMenu.map(item => (
                <li key={item.id} className="mb-1 relative">
                  {item.subItems && (!isCollapsed || isMobile) ? (
                    <>
                      <button
                        onClick={() => toggleSubMenu(item.id)}
                        className={`flex items-center text-left font-medium text-xs p-2 rounded-3xl w-full
                        ${hasActiveSubmenu(item) ? 'bg-[#F2F2F2] text-blue-600 font-bold' : 'text-gray-500'}
                        hover:bg-[#F2F2F2] hover:text-blue-600`}
                      >
                        {item.icon}
                        <span className="flex-1 ml-2">{item.title}</span>
                        {openSubMenus[item.id] ? <VscChevronDown className="h-3 w-4" /> : <VscChevronRight className="h-3 w-4" />}
                      </button>
                      {openSubMenus[item.id] && (
                        <ul className="pl-6 mt-1">
                          {item.subItems.map(sub => (
                            <li key={sub.id}>
                              <Link
                                to={sub.path}
                                onClick={isMobile ? onClose : undefined}
                                className={`flex items-center p-2 text-xs rounded-3xl
                                ${isActive(sub.path) ? 'bg-[#F2F2F2] text-blue-600 font-bold' : 'text-gray-500'}
                                hover:bg-[#F2F2F2] hover:text-blue-600`}
                              >
                                {sub.icon}
                                <span className="ml-2">{sub.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to={item.subItems && isCollapsed && !isMobile ? '#' : item.path}
                        onClick={e => {
                          if (isCollapsed && !isMobile && item.subItems) handleCollapsedMenuClick(e, item.id);
                          if (isMobile) onClose?.();
                        }}
                        title={isCollapsed && !isMobile ? item.title : ''}
                        className={`flex text-xs font-medium ${isCollapsed && !isMobile ? 'justify-center' : 'items-center'}
                        p-2 rounded-3xl hover:bg-[#F2F2F2] hover:text-blue-600
                        ${isActive(item.path) || hasActiveSubmenu(item) ? 'bg-[#F2F2F2] text-blue-600 font-bold' : 'text-gray-500'}`}
                      >
                        {isCollapsed && !isMobile
                          ? React.cloneElement(item.icon, {
                              className: `h-6 w-6 ${isActive(item.path) || hasActiveSubmenu(item) ? 'text-blue-600' : 'text-gray-500'}`,
                            })
                          : item.icon}
                        {!isCollapsed || isMobile ? <span className="ml-2">{item.title}</span> : null}
                      </Link>

                      {isCollapsed && !isMobile && activeDropdown === item.id && item.subItems && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-full top-0 ml-1 bg-white rounded-md shadow-lg p-2 w-48 z-50 max-h-[70vh] overflow-y-auto custom-scrollbar"
                        >
                          <div className="text-xs font-bold p-2 border-b border-gray-200 mb-1">{item.title}</div>
                          <ul>
                            {item.subItems.map(sub => (
                              <li key={sub.id}>
                                <Link
                                  to={sub.path}
                                  onClick={() => setActiveDropdown(null)}
                                  className={`flex items-center p-2 text-xs rounded-md
                                  ${isActive(sub.path) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}
                                  hover:bg-gray-100`}
                                >
                                  {sub.icon}
                                  <span className="ml-2">{sub.title}</span>
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

        {/* Cập nhật phần footer với thông tin từ AuthContext */}
        <div className={`border-t border-gray-200 ${isCollapsed && !isMobile ? 'py-3' : 'p-3'}`}>
          {!isCollapsed || isMobile ? (
            <div>
              <div className="flex items-center mb-2 p-2 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <Tooltip title={userData.email || "Không có email"}>
                    <p className="text-xs font-medium text-gray-700 truncate">{userData.fullName}</p>
                  </Tooltip>
                  <Tooltip title={userData.phoneNumber || "Không có số điện thoại"}>
                    <p className="text-xs text-gray-500 truncate">{userData.sRole}</p>
                  </Tooltip>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500"
                  title="Đăng xuất"
                >
                  <FiLogOut className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-center text-gray-500">PoolQMS v1.0</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Tooltip title={userData.fullName}>
                <div className="mb-2 cursor-pointer rounded-full p-2 hover:bg-gray-100">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
              </Tooltip>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500"
                title="Đăng xuất"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
              <p className="text-xs text-center text-gray-500 mt-1">v1.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;