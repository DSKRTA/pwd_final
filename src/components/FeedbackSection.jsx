import React, { useState } from 'react';
import './FeedbackSection.css';

const FeedbackSection = ({ showFeedback, setShowFeedback }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name || 'Anonymous',
            email: email || null,
            feedback: feedback.trim()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }

        const data = await response.json();
        console.log('Feedback saved to Supabase:', data);

        setSubmitted(true);
        setTimeout(() => {
          setName('');
          setEmail('');
          setFeedback('');
          setSubmitted(false);
          setShowFeedback(false);
        }, 2000);
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
      }
    }
  };

  if (!showFeedback) {
    return (
      <div className="feedback-toggle">
        <button
          className="pixel-button pixel-button-secondary"
          onClick={() => setShowFeedback(true)}
        >
          FEEDBACK
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-section pixel-panel">
      <div className="feedback-header">
        <h2 className="pixel-subtitle">FEEDBACK</h2>
        <button
          className="close-button pixel-text"
          onClick={() => setShowFeedback(false)}
        >
          ×
        </button>
      </div>
      {submitted ? (
        <div className="feedback-success pixel-text">
          Thank you for your feedback!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label className="pixel-label">NAME (OPTIONAL):</label>
            <input
              type="text"
              className="pixel-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label className="pixel-label">EMAIL (OPTIONAL):</label>
            <input
              type="email"
              className="pixel-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div className="form-group">
            <label className="pixel-label">YOUR FEEDBACK:</label>
            <textarea
              className="pixel-input pixel-textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts, suggestions, or report issues..."
              rows="5"
              required
            />
          </div>
          <button type="submit" className="pixel-button">
            SUBMIT FEEDBACK
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackSection;


