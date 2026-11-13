import { Code2, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Navbar from '../components/ui/Navbar';

const CARDS = [
  {
    icon: LayoutDashboard,
    tone: 'tone-primary',
    title: 'For managers',
    text: 'Log in, create named queues, issue tokens, reorder the line, serve the next person and cancel tokens.',
  },
  {
    icon: ShieldCheck,
    tone: 'tone-served',
    title: 'Secure by design',
    text: 'JWT authentication, hashed passwords, and every queue visible only to the manager who created it.',
  },
  {
    icon: Code2,
    tone: 'tone-waiting',
    title: 'Tech stack',
    text: 'React, Vite, Axios and Recharts on the frontend. Spring Boot, Spring Security, JPA and MySQL on the backend.',
  },
];

function About() {
  return (
    <div className="landing">
      <Navbar />
      <main className="container">
        <section className="hero" style={{ gridTemplateColumns: '1fr', paddingBottom: 40 }}>
          <div>
            <h1>
              About <em>QueueFlow</em>
            </h1>
            <p className="hero-sub">
              A full-stack queue management system that helps a counter serve people fairly,
              quickly and transparently.
            </p>
          </div>
        </section>
        <section className="about-grid">
          {CARDS.map(({ icon: Icon, tone, title, text }) => (
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

export default About;
