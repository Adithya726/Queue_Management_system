import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';
import Brand from '../components/common/Brand';

function ManagerHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen ? (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      ) : null}
      <div className="app-main">
        <header className="mobile-topbar">
          <Brand />
          <button
            type="button"
            className="icon-btn"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ManagerHome;
