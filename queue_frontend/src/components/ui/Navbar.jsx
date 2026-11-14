import { Link, NavLink } from 'react-router-dom';
import Brand from '../common/Brand';
import { useAuth } from '../../contextapi/useAuth';

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="public-nav">
      <div className="container public-nav-inner">
        <Link to="/">
          <Brand />
        </Link>
        <nav className="public-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          {isAuthenticated ? (
            <NavLink to="/manager" className="nav-cta">
              Open dashboard
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
