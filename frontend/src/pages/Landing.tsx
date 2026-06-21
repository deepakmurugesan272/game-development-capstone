import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Trophy, BookOpen, Compass, ShieldCheck } from 'lucide-react';

export const Landing: React.FC<{ onEnterApp: () => void; onLogin: () => void }> = ({ onEnterApp, onLogin }) => {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }} className="animate-fade">
      
      {/* Language selector float on top-right of landing container */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button
          onClick={toggleLanguage}
          style={{
            padding: '0.4rem 1.2rem',
            borderRadius: '20px',
            border: '1px solid var(--primary)',
            backgroundColor: 'transparent',
            color: 'var(--primary)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
        >
          {language === 'en' ? 'தமிழ் மொழிக்கு மாறுக' : 'Switch to English'}
        </button>
      </div>

      {/* Hero Welcome banner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem', gap: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
          <Sparkles size={18} />
          {t('brand_title')}
        </div>
        
        <h1 style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-main)', maxWidth: '850px' }}>
          {language === 'en' ? 'Preserving Tamil Culture, ' : 'தமிழ் மரபு விளையாட்டுக்கள், ' }
          <span style={{ color: 'var(--primary)', backgroundImage: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {language === 'en' ? 'One Turn at a Time' : 'என்றென்றும் அழியாமல்!' }
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', lineHeight: '1.6', marginTop: '0.5rem' }}>
          {t('welcome_desc')}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onEnterApp}
            style={{
              padding: '0.9rem 2rem',
              borderRadius: '30px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(229,74,45,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {language === 'en' ? 'Play Games Dashboard' : 'விளையாட்டு முகப்பிற்குச் செல்'}
          </button>
          
          <button
            onClick={onLogin}
            style={{
              padding: '0.9rem 2rem',
              borderRadius: '30px',
              backgroundColor: 'transparent',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '1.05rem',
              border: '2px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t('login')} / {language === 'en' ? 'Register' : 'பதிவுசெய்'}
          </button>
        </div>
      </div>

      {/* Cultural Showcase Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass" style={cardStyle}>
          <LibraryIconWrapper color="var(--primary)">
            <Trophy size={24} />
          </LibraryIconWrapper>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {language === 'en' ? 'Competitive AI & Leaderboards' : 'மதிப்பீட்டுத் தரவரிசை'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {language === 'en' ? 'Play against variable AI difficulty levels (Easy, Medium, Hard) or challenge your friends local pass-and-play style.' : 'எளிது, நடுத்தரம், மற்றும் கடின நிலை கணினியோடு போட்டியிட்டு உங்கள் திறமைகளை வளர்த்துக் கொள்ளுங்கள்.'}
          </p>
        </div>

        <div className="glass" style={cardStyle}>
          <LibraryIconWrapper color="var(--secondary)">
            <BookOpen size={24} />
          </LibraryIconWrapper>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {language === 'en' ? 'Cultural Knowledge Library' : 'விளையாட்டுகளின் வரலாறு'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {language === 'en' ? 'Read deep cultural significances, historical descriptions, and original spiritual meanings behind each board design.' : 'ஒவ்வொரு விளையாட்டின் பின்னுள்ள ஆன்மீகக் குறியீடுகள் மற்றும் வரலாற்றுத் தகவல்களைத் தெரிந்துகொள்ளுங்கள்.'}
          </p>
        </div>

        <div className="glass" style={cardStyle}>
          <LibraryIconWrapper color="var(--success)">
            <Compass size={24} />
          </LibraryIconWrapper>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {language === 'en' ? 'PWA Installable & Offline' : 'நெட்வொர்க் தேவையில்லை (PWA)'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {language === 'en' ? 'Install the Games Hub directly on your phone or desktop home screen. Fully functional without an internet connection!' : 'இணைப்பு இல்லாதபோதும் தடையின்றி விளையாட உங்களது மொபைல் அல்லது கணினியில் இன்ஸ்டால் செய்துகொள்ளுங்கள்.'}
          </p>
        </div>
      </div>

      {/* Numerical Stats Showcase */}
      <div className="wood-board" style={{ padding: '2.5rem', borderRadius: '20px', color: '#fff', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)', marginBottom: '3rem' }}>
        <div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--secondary)' }}>4</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>{language === 'en' ? 'Preserved Board Games' : 'பாதுகாக்கப்பட்ட விளையாட்டுகள்'}</div>
        </div>
        <div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--secondary)' }}>50 XP</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>{language === 'en' ? 'Reward Per Victory' : 'வெற்றி நன்மதிப்புகள்'}</div>
        </div>
        <div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--secondary)' }}>100%</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>{language === 'en' ? 'Free & Open Source' : 'இலவசப் பயன்பாடு'}</div>
        </div>
        <div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--secondary)' }}>Offline</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>{language === 'en' ? 'Capabilities Ready' : 'ஆஃப்லைன் ஆட்டம்'}</div>
        </div>
      </div>

    </div>
  );
};

const cardStyle = {
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.6rem'
};

const LibraryIconWrapper: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div style={{
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: `${color}15`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.8rem'
  }}>
    {children}
  </div>
);
