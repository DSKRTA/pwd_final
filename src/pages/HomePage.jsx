import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackSection from '../components/FeedbackSection';
import ColorBends from '../components/ColorBends.jsx';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const gamesSectionRef = useRef(null);

  const gameCards = [
    {
      id: 'force-motion',
      title: 'Space Push',
      subject: 'Physics',
      description:
        'Watch how two Astronauts move when pushed in Zero Gravity space!',
      image: "/push.png"
    },
    {
      id: 'aa-recipe',
      title: 'AA Recipe',
      subject: 'Biology',
      description:
        'AA stands for Amino Acids. Connect AAs to make your own unique protein!',
      image: '/aa.png'
    },
    {
      id: 'acid-reflex',
      title: 'Acid Reflex',
      subject: 'Chemistry',
      description:
        'Speed Run Edition: Identify the dominant ion before time runs out! Acid vs Base.',
      image: '/acid.png'
    }
  ];

  const advantagePoints = [
    {
      title: 'Understand Why It Works',
      description:
        'Each game is built around a core scientific principle, so you gain a deep, intuitive understanding—not just flashcard knowledge.',
      icon: '01',
      image: '/lb.png'
    },
    {
      title: 'Learn at Your Own Pace',
      description:
        'Jump into any topic, replay levels to beat your high score, and master concepts whenever it works for you.',
      icon: '02',
      image: '/rm.png'
    },
    {
      title: 'Actually Have Fun Studying',
      description:
        'We call it the “Seamless Transition from Playing to Learning.” Studying finally feels like your favorite game. Score higher and Learn faster.',
      icon: '03',
      image: '/tp.png'
    }
  ];

  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleBrowseGames = () => {
    if (gamesSectionRef.current) {
      gamesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to database
    console.log('Feedback submitted:', { name: feedbackName, email: feedbackEmail, message: feedbackMessage });
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackName('');
      setFeedbackEmail('');
      setFeedbackMessage('');
      setFeedbackSubmitted(false);
    }, 3000);
  };

  const handlePlayGame = (gameId) => {
    if (gameId === 'force-motion') {
      navigate('/games/space-push');
    } else if (gameId === 'protein-builder') {
      navigate('/games/protein-builder');
    } else {
      navigate(`/games/${gameId}`);
    }
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="logo">
          <span className="logo-text">Plearn</span>
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="user-info">
              <button className="pixel-button pixel-button-secondary" onClick={handleLogout}>
                LOG OUT
              </button>
            </div>
          ) : (
            <button className="pixel-button" onClick={handleLoginClick}>
              LOGIN
            </button>
          )}
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-background">
          <ColorBends
            colors={["#a4e5e0", "#8a5cff", "#00ffd1"]}
            rotation={30}
            speed={0.3}
            scale={0.7}
            frequency={1}
            warpStrength={1.02}
            mouseInfluence={0.8}
            parallax={0.35}
            noise={0.2}
            transparent
          />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="eyebrow">Seamless Transition from Playing to Learning</p>
            <h1 className="hero-title">
              Everything Around Us<br />Follows a Rule Called<br />Science.
            </h1>
            <p className="hero-subtitle">
              Plearn uses fun games to turn complex Science concepts into
              real understanding. No more staring at boring textbooks, jump into a level, experiment,
              and feel the knowledge snap into place.
            </p>
          </div>
        </div>
      </header>

      <section className="section pain-section">
        <div className="section-text">
          <h2 className="section-title">Reading the Textbook Isn't Working</h2>
          <p className="section-body">
            Science feels like a bunch of abstract rules that have nothing to do with real life.
          </p>
          <p className="section-body">
            It&apos;s not your fault. Science was meant to be explored, not memorized from a list of
            facts. Plearn gives you the space to experiment until it makes sense.
          </p>
        </div>
        <div className="image-note pixel-panel">
          <img src='/student1.png' style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} alt="Student studying" />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Master Science by Playing</p>
          <h2 className="section-title">Thank Us Later, We are Secretly Installing Science in Your Brain</h2>
          <p className="section-body">
            We turn hard-to-learn science concepts into game-like simulations. <br />Play around with all the customizable parameters.<br /> Look what happens and observe the difference.
          </p>
        </div>
        <div className="game-card-grid" ref={gamesSectionRef}>
          {gameCards.map((card) => (
            <div key={card.id} className="game-card pixel-panel">
              <p className="game-card-subject pixel-text">{card.subject}</p>
              <h3 className="game-card-title pixel-subtitle">{card.title}</h3>
              <p className="game-card-description">{card.description}</p>
              <div className="image-note compact">
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '250px', height: 'auto', borderRadius: '8px' }}
                />
              </div>
              <button
                className="pixel-button game-card-button"
                onClick={() => handlePlayGame(card.id === 'force-motion' ? 'space-push' : card.id)}
              >
                PLAY NOW
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2 className="section-title">The Plearn Advantage</h2>
        </div>
        <div className="advantage-grid">
          {advantagePoints.map((point) => (
            <div key={point.icon} className="advantage-card pixel-panel">
              <span className="advantage-icon">{point.icon}</span>
              <h3 className="pixel-subtitle">{point.title}</h3>
              <p className="section-body">{point.description}</p>
              <div>
                {point.image && (
                  <div className="image-note compact" style={{ marginTop: '16px' }}>
                    <img
                      src={point.image}
                      alt={point.title}
                      style={{ width: '100px', height: 'auto', borderRadius: '8px' }}
                    />
                  </div>)}
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className="section feedback-database-section">
        <div className="section-heading">
          <h2 className="section-title">We Want to Hear From You</h2>
          <p className="section-body">
            Your feedback helps us make Plearn better. <br />Share your thoughts, suggestions, or report any issues.
          </p>
        </div>
        <div className="feedback-form-container pixel-panel">
          {feedbackSubmitted ? (
            <div className="feedback-success-message">
              <h3 className="pixel-subtitle">Thank you! ✨</h3>
              <p className="pixel-text">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="feedback-database-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="pixel-label">Name (Optional)</label>
                  <input
                    type="text"
                    className="pixel-input"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label className="pixel-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="pixel-input"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="pixel-label">Your Feedback *</label>
                <textarea
                  className="pixel-input pixel-textarea"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  rows="6"
                  required
                />
              </div>
              <button type="submit" className="pixel-button">
                SUBMIT FEEDBACK
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <h2 className="footer-logo">Plearn</h2>
              <p className="footer-tagline">Seamless Transition from <br />Playing to Learning</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h3 className="footer-column-title">Contact Us</h3>
                <ul className="footer-list">
                  <li>
                    <a href="mailto:contact@plearn.com" className="footer-link">
                      📧 kimsung0114@ajou.ac.kr
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@plearn.com" className="footer-link">
                      💬 kimsung0114@ajou.ac.kr
                    </a>
                  </li>
                  <li>
                    <span className="footer-link">
                      📞 +82 (010) 2689-6365
                    </span>
                  </li>
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Tech Stack</h3>
                <ul className="footer-list">
                  <li>
                    <span className="footer-link">⚛️ React</span>
                  </li>
                  <li>
                    <span className="footer-link">🗄️ Supabase</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 Plearn. All rights reserved. Making science learning fun, one game at a time.
            </p>
          </div>
        </div>
      </footer>

      <FeedbackSection showFeedback={showFeedback} setShowFeedback={setShowFeedback} />
    </div>
  );
};

export default HomePage;

