import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';

function NotFound() {
  return (
    <div className="landing">
      <Navbar />
      <main className="not-found">
        <div>
          <h1>404</h1>
          <p>This page wandered out of the queue.</p>
          <Link to="/">
            <Button>
              <ArrowLeft size={16} /> Back to home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
