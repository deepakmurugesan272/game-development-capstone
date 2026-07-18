import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogIn, Key, Mail, ShieldAlert, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const Login: React.FC<{ onSwitchToRegister: () => void; onSuccess: () => void }> = ({ onSwitchToRegister, onSuccess }) => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0);

  const gameShowcases = [
    {
      title: 'பரமபதம் / Paramapadham',
      subtitle: 'Snakes & Ladders (ஆன்மாவின் பயணம்)',
      desc: 'An ancient moral board game depicting the journey of the soul to salvation (Vaikundam). Ladders represent virtues that elevate us, and snakes represent vices that throw us back into rebirth.',
      descTa: 'வீடுபேறுக்கான ஆன்மாவின் ஆன்மீகப் பயணம். நற்பண்புகள் (ஏணிகள்) நம்மை உயர்த்தும்; தீய குணங்கள் (பாம்புகள்) பிறவிச்சுழலுக்குத் தள்ளும்.',
      rules: ['Roll dice to advance.', 'Ladders climb you up.', 'Snakes slide you down.', 'Land exactly on 100 to win.'],
      rulesTa: ['பகடை உருட்டி முன்னோக்கிச் செல்லவும்.', 'ஏணிகள் உங்களை மேலே உயர்த்தும்.', 'பாம்புகள் கீழே தள்ளும்.', 'சரியாக 100-வது கட்டம் அடைந்து வெல்லவும்.']
    },
    {
      title: 'பல்லாங்குழி / Pallanguzhi',
      subtitle: 'The Sowing Game (அறுவடை ஆட்டம்)',
      desc: 'A classical mathematical pit-and-pebble board game played in southern India to build strategic planning, division skills, and hand-eye coordination.',
      descTa: 'கணித மற்றும் பகுத்துணர்வுத் திறன்களை வளர்க்கும் பாரம்பரிய குழி-முத்து விளையாட்டு. உத்தியும் நுட்பமுமே இதில் வெற்றியைத் தரும்.',
      rules: ['Sow seeds around pits.', 'Empty pit ends your turn.', 'Capture seeds when a pit has 4 seeds.', 'Accumulate most seeds to win.'],
      rulesTa: ['குழிகளில் முத்துக்களைப் பகிர்ந்து விதைக்கவும்.', 'வெறுங்குழி வந்தால் ஆட்டம் மாறும்.', 'குழியில் 4 முத்துக்கள் சேர்ந்தால் கைப்பற்றலாம்.', 'அதிக முத்துக்களைச் சேகரிப்பவர் வெற்றியாளர்.']
    },
    {
      title: 'ஆடு புலி ஆட்டம் / Goats & Tigers',
      subtitle: 'The Asymmetric Hunt (உத்தி ஆட்டம்)',
      desc: 'An ancient tactical hunting board game played on a triangular grid. One player controls 3 tigers while the other controls 15 goats.',
      descTa: 'முக்கோணக் கட்டத்தில் ஆடப்படும் பாரம்பரிய ஆடு-புலி வேட்டை விளையாட்டு. 3 புலிகளுக்கு எதிராக 15 ஆடுகள் தந்திரமாகப் போரிடும்.',
      rules: ['Tigers try to capture goats by jumping.', 'Goats try to block and trap tigers.', 'Tigers win if they eat most goats.', 'Goats win if tigers cannot move.'],
      rulesTa: ['புலிகள் ஆடுகளைத் தாண்டி வெட்டி வீழ்த்த முயலும்.', 'ஆடுகள் புலிகளை நகர்த்த முடியாமல் முடக்க முயலும்.', 'புலிகள் ஆடுகளைக் கொன்றால் வெற்றி.', 'புலிகளை முடக்கினால் ஆடுகள் வெற்றி.']
    },
    {
      title: 'தாயக்கட்டை / Dayakattai',
      subtitle: 'Ancient Race of Dice (தாய ஆட்டம்)',
      desc: 'A historical racing board game played with long brass dice. Players race their pawns to the center palace while knocking out opponents.',
      descTa: 'பழங்கால நீளப்பகடை கொண்டு விளையாடப்படும் தாய விளையாட்டு. காய்களை வெட்டி வீழ்த்தி நடுமனைக்குக் கொண்டு செல்லும் ஓட்டப்பந்தயம்.',
      rules: ['Roll long dice (Dayakattai) to move.', 'Need a 1 (Daya) to start pawns.', 'Cut opponent pawns on open squares.', 'Reach the center palace (Mani) first.'],
      rulesTa: ['நீள தாயக்கட்டையை உருட்டி நகர்த்தவும்.', 'காயைத் தொடங்க "தாயம்" (1) விழ வேண்டும்.', 'எதிரியின் காயை வெட்டி வீழ்த்தலாம்.', 'நடுமனையைச் முதலில் சென்றடைபவர் வெற்றி.']
    }
  ];

  // Auto rotate showcase slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % gameShowcases.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(emailOrUsername, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const OilLamp = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="oil-lamp-flicker">
      <path d="M12 2C12 2 9 6 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 6 12 2 12 2Z" fill="#fbbf24" />
      <path d="M5 15C5 12 8 12 12 12C16 12 19 12 19 15C19 18 16 20 12 20C8 20 5 18 5 15Z" fill="#b28a2a" />
      <path d="M12 14C10 14 8.5 14.5 8.5 15C8.5 15.5 10 16 12 16C14 16 15.5 15.5 15.5 15C15.5 14.5 14 14 12 14Z" fill="#78350f" opacity="0.3" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      
      {/* Split Screen Layout Container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: '2.5rem', 
        justifyContent: 'center', 
        alignItems: 'stretch', 
        maxWidth: '1000px', 
        width: '100%',
        margin: '2rem auto'
      }}>
        
        {/* Left Panel: Pulavar Showcase */}
        <div 
          className="glass animate-fade" 
          style={{ 
            flex: '1 1 420px', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '2px solid var(--border-color)', 
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
            <img 
              src="/tamil_pulavar.jpg" 
              alt="Tamil Pulavar" 
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid var(--secondary)', boxShadow: '0 3px 10px rgba(229,192,96,0.3)', objectFit: 'cover' }} 
            />
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {language === 'en' ? 'Tamil Pulavar Guide' : 'தமிழ் புலவர் வழிகாட்டி'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {language === 'en' ? '"Learn the rules, play with honor"' : '"அறமறிந்து ஆடு, மரபு காத்து மகிழ்"'}
              </p>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {language === 'en' ? 'Featured Game' : 'சிறப்பு ஆட்டம்'}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  onClick={() => setActiveSlide(prev => (prev - 1 + gameShowcases.length) % gameShowcases.length)}
                  style={arrowBtnStyle}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setActiveSlide(prev => (prev + 1) % gameShowcases.length)}
                  style={arrowBtnStyle}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {gameShowcases[activeSlide].title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.1rem' }}>
                {gameShowcases[activeSlide].subtitle}
              </p>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', minHeight: '75px' }}>
              {language === 'en' ? gameShowcases[activeSlide].desc : gameShowcases[activeSlide].descTa}
            </p>

            <div style={{ marginTop: '0.5rem' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <BookOpen size={14} /> {language === 'en' ? 'Rules & Objectives' : 'விளையாடும் முறைகள்'}
              </h5>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {(language === 'en' ? gameShowcases[activeSlide].rules : gameShowcases[activeSlide].rulesTa).map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
            {gameShowcases.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: idx === activeSlide ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Panel: Ancient Scroll Login Form */}
        <div 
          className="wood-board animate-fade" 
          style={{ 
            flex: '1 1 380px', 
            borderRadius: '20px', 
            padding: '2.5rem 2rem', 
            position: 'relative',
            boxShadow: 'var(--shadow-lg), 0 10px 30px rgba(139, 74, 29, 0.2)',
            border: '8px solid #5a2e0f',
            backgroundImage: 'linear-gradient(rgba(253, 251, 247, 0.95), rgba(253, 251, 247, 0.95)), var(--wood-grain)',
            color: '#3c1405'
          }}
        >
          {/* Glowing Oil Lamps at the top corners */}
          <div style={{ position: 'absolute', top: '-14px', left: '10px', zIndex: 10 }}>
            <OilLamp />
          </div>
          <div style={{ position: 'absolute', top: '-14px', right: '10px', zIndex: 10 }}>
            <OilLamp />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
              வணக்கம் / Welcome Back
            </h2>
            <p style={{ color: '#5c4033', fontSize: '0.88rem', fontWeight: 700, marginTop: '0.3rem' }}>
              {language === 'en' ? 'Log in to your heritage profile' : 'உங்கள் விளையாட்டு கணக்கிற்குள் நுழையவும்'}
            </p>
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5c4033' }}>
                {language === 'en' ? 'Username or Email' : 'பயனர் பெயர் / மின்னஞ்சல்'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5a2b' }} />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Enter username or email' : 'பெயரை உள்ளிடவும்'}
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5c4033' }}>
                {language === 'en' ? 'Password' : 'கடவுச்சொல்'}
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5a2b' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Ancient key unlock animation when loading */}
            <button
              type="submit"
              disabled={loading}
              style={submitBtnStyle(loading)}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Key size={18} className="unlocking-key" />
                  <span style={{ color: '#3b2005' }}>{language === 'en' ? 'Unlocking Hub...' : 'கதவு திறக்கிறது...'}</span>
                </div>
              ) : (
                <span style={{ color: '#3b2005' }}>{language === 'en' ? 'Enter Heritage Hub' : 'உள்நுழைக'}</span>
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid rgba(139,74,29,0.2)', marginTop: '2rem', paddingTop: '1.2rem', textAlign: 'center', fontSize: '0.88rem', color: '#5c4033', fontWeight: 700 }}>
            {language === 'en' ? 'New to the Hub?' : 'புதிய கணக்கு வேண்டுமா?'}{' '}
            <span onClick={onSwitchToRegister} style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
              {language === 'en' ? 'Register Now' : 'இங்கே பதியவும்'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Custom styles
const inputStyle = {
  width: '100%',
  padding: '0.8rem 0.8rem 0.8rem 2.2rem',
  borderRadius: '8px',
  border: '2px solid #b28a2a',
  backgroundColor: '#fdfbf7',
  color: '#3c1405',
  fontWeight: 600,
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const arrowBtnStyle = {
  backgroundColor: 'rgba(229, 74, 45, 0.1)',
  border: 'none',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--primary)',
  transition: 'all 0.2s ease',
};

const submitBtnStyle = (loading: boolean) => ({
  width: '100%',
  padding: '0.9rem',
  background: 'var(--brass-grain)',
  color: '#3b2005',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: loading ? 'default' : 'pointer',
  boxShadow: '0 4px 15px rgba(178,138,42,0.4)',
  marginTop: '0.5rem',
  transition: 'transform 0.2s ease',
});
