import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../contextapi/AuthContext';
import './landing.css';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">Queue manager workspace</p>
            <h1>Run named queues, issue tokens, and serve people in order.</h1>
            <p>
              Managers log in, create queues, add people as tokens, rearrange the
              waiting list, assign the person at the top for service, cancel tokens,
              and watch wait times on the dashboard.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/manager">
                  <Button>Open dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button>Manager login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="secondary">Create manager account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-panel">
            <div className="stat-row">
              <div className="mini-stat">
                <span>1</span>
                <strong>Login & create queues</strong>
              </div>
              <div className="mini-stat">
                <span>2</span>
                <strong>Add people as tokens</strong>
              </div>
              <div className="mini-stat">
                <span>3</span>
                <strong>Move, serve, or cancel</strong>
              </div>
              <div className="mini-stat">
                <span>4</span>
                <strong>Track wait & length</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="feature-grid">
          <article className="feature-card">
            <h3>Named queues</h3>
            <p>Every queue has a name so a manager can run billing, reception, or any counter separately.</p>
          </article>
          <article className="feature-card">
            <h3>Token waiting list</h3>
            <p>Adding a person creates a token. The list shows everyone waiting, with move up / move down controls.</p>
          </article>
          <article className="feature-card">
            <h3>Serve and cancel</h3>
            <p>One click assigns the token at the top for service. Any waiting token can be cancelled from the list.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default Home;
