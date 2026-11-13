import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contextapi/AuthContext';

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="public-nav">
      <div className="container public-nav-inner">
        <Link to="/" className="brand">
          QueueFlow
        </Link>
        <nav className="public-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          {isAuthenticated ? (
            <NavLink to="/manager" className="nav-cta">
              Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="nav-cta">
                Get started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
