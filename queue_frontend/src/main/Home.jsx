import { Link } from 'react-router-dom';
import { ArrowRight, ChartColumn, ListOrdered, Zap } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../contextapi/useAuth';

const FEATURES = [
  {
    icon: ListOrdered,
    tone: 'tone-primary',
    title: 'Smart queues',
    text: 'Create a named queue for every counter. Each person gets a token, and you can reorder or cancel anyone in one click.',
  },
  {
    icon: Zap,
    tone: 'tone-served',
    title: 'One-click serving',
    text: 'Call the person at the top of the line with a single button, then mark them served when they are done.',
  },
  {
    icon: ChartColumn,
    tone: 'tone-waiting',
    title: 'Live analytics',
    text: 'Average and longest waits, service time, outcomes and queue length trends for every queue.',
  },
];

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      <Navbar />
      <main className="container">
        <section className="hero">
          <div>
            <span className="hero-pill">
              <Zap size={14} /> Queue management, simplified
            </span>
            <h1>
              Serve people in order, <em>without the chaos.</em>
            </h1>
            <p className="hero-sub">
              QueueFlow gives every counter a clean digital queue: issue tokens, move people up or
              down, serve the next person in one click and watch wait times live.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/manager">
                  <Button size="lg">
                    Open dashboard <ArrowRight size={18} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">
                      Get started free <ArrowRight size={18} />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="secondary">
                      Manager login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-preview" aria-hidden="true">
            <div className="preview-serving">
              <div>
                <span>Now serving</span>
                <strong>#024</strong>
                Priya Sharma
              </div>
              <span className="badge badge-served" style={{ letterSpacing: 0 }}>2 min</span>
            </div>
            {[
              ['#025', 'Rahul Verma', '~3 min'],
              ['#026', 'Ananya Rao', '~6 min'],
              ['#027', 'Karthik N', '~9 min'],
            ].map(([no, name, eta], index) => (
              <div key={no} className="preview-row">
                <span className="pos">{index + 1}</span>
                <strong className="ticket-no">{no}</strong>
                <span>{name}</span>
                <span className="stat-hint">{eta}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="feature-row">
          {FEATURES.map(({ icon: Icon, tone, title, text }) => (
            <article key={title} className={`feature ${tone}`}>
              <span className="stat-icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Home;
