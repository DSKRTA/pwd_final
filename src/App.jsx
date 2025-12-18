import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ScoreProvider } from './contexts/ScoreContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SpacePush from './games/SpacePush';
import AARecipe from './games/AARecipe';
import AcidReflex from './games/AcidReflex';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ScoreProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/games/space-push" element={<SpacePush />} />
              <Route path="/games/aa-recipe" element={<AARecipe />} />
              <Route path="/games/acid-reflex" element={<AcidReflex />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ScoreProvider>
    </AuthProvider>
  );
}

export default App;

