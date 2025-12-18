import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ScoreContext = createContext();

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
};

export const ScoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [scores, setScores] = useState({});
  const API_URL = 'http://localhost:3001'; // Adjust if needed

  useEffect(() => {
    // Load scores from Backend (specifically Acid Reflex for now)
    if (user && user.username) {
      fetch(`${API_URL}/api/scores/acid-reflex/${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.score) {
            // Store in state matching the key format: gameId_metric
            setScores(prev => ({ ...prev, 'acid-reflex_time': data.score }));
          }
        })
        .catch(err => console.error('Failed to fetch score:', err));
    }
  }, [user]);

  const updateScore = async (gameId, score, metric = 'score') => {
    if (!user) return;

    // Optimistic update
    const key = `${gameId}_${metric}`;
    const currentBest = scores[key];

    let isBetter = false;
    if (currentBest === undefined) {
      isBetter = true;
    } else if (metric === 'shots' || metric === 'attempts' || metric === 'time') {
      isBetter = score < currentBest;
    } else {
      isBetter = score > currentBest;
    }

    if (isBetter) {
      const newScores = {
        ...scores,
        [key]: score
      };
      setScores(newScores);

      // Save to Backend
      try {
        await fetch(`${API_URL}/api/scores/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.username,
            gameId,
            score,
            metric
          })
        });
      } catch (err) {
        console.error('Failed to save score:', err);
      }
      return true; // New record
    }
    return false;
  };

  const getScore = (gameId, metric = 'score') => {
    const key = `${gameId}_${metric}`;
    return scores[key];
  };

  const value = {
    scores,
    updateScore,
    getScore
  };

  return (
    <ScoreContext.Provider value={value}>
      {children}
    </ScoreContext.Provider>
  );
};


