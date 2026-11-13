import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import './landing.css';

function NotFound() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="not-found">
        <div>
          <h1>404</h1>
          <p>This page does not exist.</p>
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
