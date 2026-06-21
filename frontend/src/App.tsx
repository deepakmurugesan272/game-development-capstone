import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { KolamBackground } from './components/KolamBackground';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Lobby } from './pages/Lobby';
import { Leaderboard } from './pages/Leaderboard';
import { Rules } from './pages/Rules';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Import Games
import { Pallanguzhi } from './games/Pallanguzhi/Pallanguzhi';
import { AaduPuliAattam } from './games/AaduPuliAattam/AaduPuliAattam';
import { Paramapadham } from './games/Paramapadham/Paramapadham';
import { Dayakattai } from './games/Dayakattai/Dayakattai';

export const App: React.FC = () => {
  // Default to landing page for premium wow factor
  const [tab, setTab] = useState<string>('landing');

  const renderContent = () => {
    switch (tab) {
      case 'landing':
        return (
          <Landing 
            onEnterApp={() => setTab('dashboard')} 
            onLogin={() => setTab('login')} 
          />
        );
      case 'dashboard':
        return <Dashboard onSelectGame={(gameType) => setTab(gameType)} />;
      case 'lobby':
        return <Lobby onLaunchGame={(gameType) => setTab(gameType)} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'rules':
        return <Rules />;
      case 'profile':
        return <Profile />;
      case 'login':
        return (
          <Login 
            onSwitchToRegister={() => setTab('register')} 
            onSuccess={() => setTab('dashboard')} 
          />
        );
      case 'register':
        return (
          <Register 
            onSwitchToLogin={() => setTab('login')} 
            onSuccess={() => setTab('dashboard')} 
          />
        );
      case 'pallanguzhi':
        return <Pallanguzhi />;
      case 'aadupuli':
        return <AaduPuliAattam />;
      case 'paramapadham':
        return <Paramapadham />;
      case 'dayakattai':
        return <Dayakattai />;
      default:
        return <Dashboard onSelectGame={(gameType) => setTab(gameType)} />;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Do not render navbar on Landing page to keep it clean, or render it everywhere */}
      {tab !== 'landing' && <Navbar currentTab={tab} onChangeTab={setTab} />}
      
      {/* Kolam Watermarks floating background */}
      <KolamBackground />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          padding: '1.2rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-card)',
          zIndex: 10
        }}
      >
        © {new Date().getFullYear()} Tamil Heritage Games Hub. Designed with 💖 to preserve traditional game assets.
      </footer>
    </div>
  );
};

export default App;
