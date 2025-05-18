import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { VscMenu } from "react-icons/vsc";

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px là breakpoint tiêu chuẩn cho mobile
    };
    
    // Kiểm tra khi component mount
    checkIfMobile();
    
    // Thêm event listener để kiểm tra khi resize window
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup event listener khi component unmount
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar 
          isMobile={true}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar onToggle={handleSidebarToggle} />
      )}
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 bg-gray-100 min-w-0 ${
          !isMobile ? (sidebarCollapsed ? 'ml-20' : 'ml-64') : 'ml-0'
        }`}
      >
        {/* Mobile header with menu button */}
        {isMobile && (
          <header className="bg-white p-4 shadow-md flex items-center">
            <button 
              onClick={toggleMobileSidebar}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none mr-3"
            >
              <VscMenu size={24} />
            </button>
            <h1 className="text-xl font-bold">AquaMonitor</h1>
          </header>
        )}
        
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
