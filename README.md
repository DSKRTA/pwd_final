# G-Lab Science Simulation Challenges

An educational website featuring science-themed games for children, built with React. The games focus on physics and chemistry concepts with a pixel art design aesthetic.

## Features

- **5 Educational Games:**
  - **Castle Breaker** - Learn projectile motion by adjusting angle and power to destroy a castle
  - **Ski Jump Champion** - Understand mechanical energy through ski jumping
  - **Laser Guardian** - Explore light refraction by manipulating refractive blocks
  - **Circuit Master** - Master Ohm's Law by building circuits
  - **Alkali Detective** - Practice acid-base titration to reach target pH levels

- **User Authentication:**
  - Login/Logout functionality
  - Persistent user sessions (localStorage)

- **Score Tracking:**
  - Tracks highest scores for each game
  - Different metrics per game (shots, distance, score, accuracy)
  - Scores are saved per user

- **Customizable Parameters:**
  - Each game has adjustable parameters (angles, power, resistance, pH, etc.)
  - Real-time physics simulations
  - Visual feedback

- **Feedback System:**
  - Users can submit feedback from the main page
  - Feedback button in bottom-right corner

- **Pixel Art Design:**
  - Retro pixel art aesthetic
  - Jersey 10 font from Google Fonts
  - Neon blue and orange color scheme

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Development Server (Recommended - Vite)
1. Start the development server:
   ```bash
   npm run dev
   ```
2. The browser will automatically open at `http://localhost:3000`
   - Vite's dev server is much faster than Create React App
   - Hot Module Replacement (HMR) for instant updates

#### Option 2: Preview Production Build
1. Build the application first:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run serve
   ```
   This uses Vite's preview server at `http://localhost:8080`

#### Option 3: Using live-server (After Building)
1. Build the application:
   ```bash
   npm run build
   ```

2. Serve with live-server:
   ```bash
   npm run live
   ```
   or
   ```bash
   npm run serve:live
   ```
   This builds and serves with live-server at `http://localhost:8080`

   **Note:** The application is configured to use relative paths, making it compatible with live-server and other static file servers. 

#### Option 4: Using Custom Node Server (Recommended for Production-like Testing)
1. Build the application:
   ```bash
   npm run build
   ```

2. Serve with the custom Node.js server:
   ```bash
   npm run serve:custom
   ```
   This uses a custom server that properly handles React Router's client-side routing by serving `index.html` for all routes. The server runs at `http://localhost:8080`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder (Vite uses `dist` instead of `build`).

## Project Structure

```
src/
├── components/          # Reusable components
│   └── FeedbackSection.js
├── contexts/           # React contexts for state management
│   ├── AuthContext.js  # User authentication
│   └── ScoreContext.js # Score tracking
├── games/              # Game components
│   ├── CastleBreaker.js
│   ├── SkiJump.js
│   ├── LaserGuardian.js
│   ├── CircuitMaster.js
│   └── AlkaliDetective.js
├── pages/              # Page components
│   ├── HomePage.js     # Main game selection page
│   └── LoginPage.js    # Login page
├── App.js              # Main app component with routing
├── App.css             # Global app styles
├── index.js            # Entry point
└── index.css           # Global styles
```

## Game Mechanics

### Castle Breaker
- Adjust launch angle (0-90°) and power (10-100)
- Goal: Destroy the castle in the fewest shots
- Tracks: Number of shots taken

### Ski Jump Champion
- Adjust speed (20-100) and jump angle (10-60°)
- Goal: Maximize jump distance
- Tracks: Distance in meters

### Laser Guardian
- Adjust refractive index (1.0-2.5), block position, and angle
- Goal: Refract laser to hit the target
- Tracks: Score (points for hitting targets)

### Circuit Master
- Adjust voltage (3-18V) and two resistances (5-50Ω)
- Goal: Achieve target current using Ohm's Law (V = I × R)
- Tracks: Score (points for correct answers)

### Alkali Detective
- Add base solution in increments (0.1ml, 0.5ml, 1.0ml)
- Goal: Reach target pH level
- Tracks: Accuracy percentage

## Technologies Used

- **React** - UI framework
- **React Router** - Navigation and routing
- **HTML5 Canvas** - Game rendering
- **Google Fonts (Jersey 10)** - Pixel art font
- **CSS3** - Styling with pixel art aesthetic
- **localStorage** - Persistent data storage

## Customization

### Adding New Games

1. Create a new component in `src/games/`
2. Add the route in `src/App.js`
3. Add game information to the `games` array in `src/pages/HomePage.js`
4. Implement score tracking using the `useScore` hook

### Modifying Game Parameters

Each game has customizable parameters that can be adjusted in the game component's state. Modify the min/max values of sliders and inputs to change the parameter ranges.

### Styling

The pixel art style is maintained through:
- `image-rendering: pixelated` CSS property
- Jersey 10 font
- Sharp borders and solid colors
- Neon blue (#00d4ff) and orange (#ff6b35) color scheme

## Notes

- For demo purposes, any username and password will work for login
- Scores are stored in localStorage (browser-specific)
- In a production environment, you would connect to a backend API for authentication and score storage

## License

This project is created for educational purposes.

## Version

G-LAB 2024 - V1.0

