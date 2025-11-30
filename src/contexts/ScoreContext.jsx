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

  useEffect(() => {
    // Load scores from localStorage
    if (user) {
      const savedScores = localStorage.getItem(`scores_${user.username}`);
      if (savedScores) {
        setScores(JSON.parse(savedScores));
      } else {
        setScores({});
      }
    } else {
      setScores({});
    }
  }, [user]);

  const updateScore = (gameId, score, metric = 'score') => {
    if (!user) return;

    const key = `${gameId}_${metric}`;
    const currentBest = scores[key];
    
    // Determine if this is a better score
    // For distance/time-based: higher is better
    // For shots/attempts: lower is better
    let isBetter = false;
    if (currentBest === undefined) {
      isBetter = true;
    } else if (metric === 'shots' || metric === 'attempts') {
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
      localStorage.setItem(`scores_${user.username}`, JSON.stringify(newScores));
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


