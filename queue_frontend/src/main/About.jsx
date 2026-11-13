import Navbar from '../components/ui/Navbar';
import './landing.css';

function About() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="container">
        <section className="hero">
          <div>
            <h1>About QueueFlow</h1>
            <p>
              QueueFlow is a full-stack queue management app: React for the manager
              workspace and Spring Boot for auth, queues, tokens, and analytics.
            </p>
          </div>
        </section>
        <section className="about-grid">
          <article className="about-card">
            <h3>For managers</h3>
            <p>Login, create named queues, issue tokens, reorder, serve the next person, and cancel tokens.</p>
          </article>
          <article className="about-card">
            <h3>Dashboard</h3>
            <p>See people waiting, average wait, service time, and queue length trends in one place.</p>
          </article>
          <article className="about-card">
            <h3>Stack</h3>
            <p>React, Vite, Axios, Recharts on the frontend. Spring Boot, JWT, and MySQL on the backend.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default About;
