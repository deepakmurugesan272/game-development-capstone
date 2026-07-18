import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Volume2, VolumeX, Music, Library, Trophy, LogOut, LogIn, User, LayoutDashboard, Languages, Users } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onChangeTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useSound();
  const { language, toggleLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
    onChangeTab('dashboard');
  };

  return (
    <nav 
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.8rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Brand Logo */}
      <div 
        onClick={() => onChangeTab('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '1.8rem' }}>🕉️</span>
        <div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            {t('brand_title')}
          </span>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('brand_subtitle')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button 
          onClick={() => onChangeTab('dashboard')}
          style={tabButtonStyle(currentTab === 'dashboard')}
        >
          <LayoutDashboard size={15} /> {t('dashboard')}
        </button>
        <button 
          onClick={() => onChangeTab('lobby')}
          style={tabButtonStyle(currentTab === 'lobby')}
        >
          <Users size={15} /> {t('multiplayer_lobby')}
        </button>
        <button 
          onClick={() => onChangeTab('leaderboard')}
          style={tabButtonStyle(currentTab === 'leaderboard')}
        >
          <Trophy size={15} /> {t('leaderboard')}
        </button>
        <button 
          onClick={() => onChangeTab('rules')}
          style={tabButtonStyle(currentTab === 'rules')}
        >
          <Library size={15} /> {t('rules_history')}
        </button>
      </div>

      {/* Controls & User Account */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        {/* Toggle Language */}
        <button 
          onClick={toggleLanguage}
          title={language === 'en' ? 'தமிழில் மாற்றுக' : 'Switch to English'}
          style={controlBtnStyle}
        >
          <Languages size={17} style={{ color: 'var(--primary)' }} />
        </button>

        {/* Toggle Ambient Music */}
        <button 
          onClick={toggleMusic}
          title={musicEnabled ? 'Mute Music' : 'Play Ambient Music'}
          style={{ ...controlBtnStyle, color: musicEnabled ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          <Music size={17} />
        </button>

        {/* Toggle Sound */}
        <button 
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          style={controlBtnStyle}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        {/* Toggle Theme */}
        <button 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
          style={controlBtnStyle}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Auth / Profile actions */}
        {user ? (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button 
              onClick={() => onChangeTab('profile')}
              style={tabButtonStyle(currentTab === 'profile')}
            >
              <User size={15} /> {t('profile')}
            </button>
            <button 
              onClick={handleLogout}
              style={{ ...controlBtnStyle, color: 'var(--danger)' }}
              title={t('logout')}
            >
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onChangeTab('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <LogIn size={15} /> {t('login')}
          </button>
        )}
      </div>
    </nav>
  );
};

const tabButtonStyle = (active: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 0.7rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: active ? 'rgba(229,74,45,0.08)' : 'transparent',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  fontWeight: active ? 700 : 500,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const controlBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'transparent',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};
