import Button from '../components/ui/Button';
import { useAuth } from '../contextapi/AuthContext';

function ManagerNavbar({ onMenuClick }) {
  const { auth, logout } = useAuth();

  return (
    <header className="manager-navbar">
      <Button variant="ghost" className="menu-btn" onClick={onMenuClick}>
        Menu
      </Button>
      <strong>Queue manager</strong>
      <div className="manager-user">
        <span>{auth?.name}</span>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default ManagerNavbar;
