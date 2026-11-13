import { NavLink } from 'react-router-dom';
import { ChartColumn, LayoutDashboard, ListOrdered, LogOut } from 'lucide-react';
import Brand from './Brand';
import { useAuth } from '../../contextapi/AuthContext';

const LINKS = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/queues', label: 'Queues', icon: ListOrdered },
  { to: '/manager/analytics', label: 'Analytics', icon: ChartColumn },
];

function Sidebar({ open, onClose }) {
  const { auth, logout } = useAuth();
  const initial = (auth?.name || 'M').trim().charAt(0).toUpperCase();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <Brand />
      <p className="sidebar-label">Workspace</p>
      <nav className="sidebar-nav">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onClose}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="avatar">{initial}</span>
          <div className="user-chip-text">
            <strong>{auth?.name || 'Manager'}</strong>
            <span>{auth?.email}</span>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
