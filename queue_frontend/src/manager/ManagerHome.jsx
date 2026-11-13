import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ManagerNavbar from './ManagerNavbar';
import './manager.css';

function ManagerHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="manager-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen ? (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      ) : null}
      <div className="manager-main">
        <ManagerNavbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        <div className="manager-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ManagerHome;
