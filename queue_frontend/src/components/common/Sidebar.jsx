import { NavLink } from 'react-router-dom';

function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">QueueFlow</div>
      <p className="sidebar-caption">Manager console</p>
      <nav className="sidebar-nav">
        <NavLink to="/manager" end onClick={onClose}>
          Dashboard
        </NavLink>
        <NavLink to="/manager/queues" onClick={onClose}>
          Queues
        </NavLink>
        <NavLink to="/manager/analytics" onClick={onClose}>
          Analytics
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
