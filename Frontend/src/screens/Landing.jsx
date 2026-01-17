import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      {/* NAVBAR */}
      <header className="landing-header">
        <div className="logo">SignAge</div>
        <Link to="/login" className="login-btn">
          Login
        </Link>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>
          Inclusive Sign Language <br />
          <span>Learning for Every Child</span>
        </h1>

        <p>
          SignAge is an AI-powered platform that helps children learn sign
          language in a simple, interactive way — reducing social barriers and
          building inclusive communication.
        </p>

        <Link to="/login" className="cta-btn">
          Start Learning
        </Link>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature-card">
          <h3>🧠 AI-Powered Learning</h3>
          <p>
            Real-time gesture recognition using computer vision for accurate
            sign validation.
          </p>
        </div>

        <div className="feature-card">
          <h3>🤝 Inclusive Education</h3>
          <p>
            Helps normal and special children communicate and learn together.
          </p>
        </div>

        <div className="feature-card">
          <h3>📱 Simple & Engaging</h3>
          <p>
            Child-friendly UI designed for easy understanding and interaction.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        © {new Date().getFullYear()} SignAge • Built for Inclusive Learning
      </footer>
    </div>
  );
};

export default Landing;
