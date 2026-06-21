import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Award, Trophy, Sparkles, UserCheck, Calendar, CheckSquare, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameCardProps {
  title: string;
  tamilTitle: string;
  desc: string;
  type: string;
  color: string;
  imgMotif: string;
  onSelect: (game: string) => void;
  stats?: { played: number; wins: number };
}

const GameCard: React.FC<GameCardProps> = ({ title, tamilTitle, desc, type, color, imgMotif, onSelect, stats }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="glass"
      style={{
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: `6px solid ${color}`,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => onSelect(type)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.08, fontSize: '6rem', pointerEvents: 'none', color: color, fontWeight: 'bold' }}>
        {imgMotif}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Traditional Game</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{tamilTitle}</span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1.2rem' }}>{desc}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
        {stats ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Played: <strong style={{ color: 'var(--text-main)' }}>{stats.played}</strong> | Wins: <strong style={{ color: 'var(--success)' }}>{stats.wins}</strong>
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Log in to track stats</div>
        )}
        <button 
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: color,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {t('play_now')}
        </button>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ onSelectGame: (game: string) => void }> = ({ onSelectGame }) => {
  const { user, updateGuestCoins } = useAuth();
  const { t, language } = useLanguage();

  // Streak Tracker
  const [streak, setStreak] = useState<number>(1);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Daily challenges
  const [challenges, setChallenges] = useState([
    { id: 'ch-1', text: 'Play a match of Pallanguzhi', completed: false, coins: 15 },
    { id: 'ch-2', text: 'Roll a Thayam (1) in Dayakattai', completed: false, coins: 20 },
    { id: 'ch-3', text: 'Defeat AI in Goats & Tigers', completed: false, coins: 30 }
  ]);

  // Load / Update Streak
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastLogin = localStorage.getItem('thgh_last_login');
    const savedStreak = localStorage.getItem('thgh_login_streak');
    const savedClaimed = localStorage.getItem('thgh_reward_claimed_date');

    let currentStreak = savedStreak ? Number(savedStreak) : 1;

    if (lastLogin) {
      const diffTime = Math.abs(new Date(today).getTime() - new Date(lastLogin).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1; // reset streak
      }
    }

    setStreak(currentStreak);
    localStorage.setItem('thgh_login_streak', String(currentStreak));
    localStorage.setItem('thgh_last_login', today);

    if (savedClaimed === today) {
      setRewardClaimed(true);
    } else {
      setRewardClaimed(false);
    }

    // Load challenges state
    const savedChalls = localStorage.getItem('thgh_daily_challenges');
    const challsDate = localStorage.getItem('thgh_challenges_date');
    if (savedChalls && challsDate === today) {
      setChallenges(JSON.parse(savedChalls));
    } else {
      // Reset daily challenges completed status
      localStorage.setItem('thgh_challenges_date', today);
      localStorage.setItem('thgh_daily_challenges', JSON.stringify(challenges));
    }
  }, []);

  const handleClaimStreakReward = () => {
    if (rewardClaimed) return;
    
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('thgh_reward_claimed_date', today);
    setRewardClaimed(true);

    const bonus = streak * 10;
    updateGuestCoins(bonus);
    
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    alert(`Successfully claimed ${bonus} coins for your ${streak}-day login streak!`);
  };

  const handleToggleChallenge = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.completed;
        if (nextState) {
          updateGuestCoins(ch.coins);
          confetti({ particleCount: 30, spread: 50 });
        } else {
          updateGuestCoins(-ch.coins);
        }
        return { ...ch, completed: nextState };
      }
      return ch;
    });
    setChallenges(updated);
    localStorage.setItem('thgh_daily_challenges', JSON.stringify(updated));
  };

  const games = [
    {
      title: 'Pallanguzhi',
      tamilTitle: 'பல்லாங்குழி',
      desc: 'The legendary seed sowing board game. Maximize captures through tactical sowing cascades and mathematical calculations.',
      type: 'pallanguzhi',
      color: '#e55934',
      motif: 'Cup',
      imgMotif: '🕳'
    },
    {
      title: 'Aadu Puli Aattam',
      tamilTitle: 'ஆடு புலி ஆட்டம்',
      desc: 'Goats and Tigers: A strategic hunt game where 3 tigers hunt 15 goats. Can you trap the tigers or will they kill all goats?',
      type: 'aadupuli',
      color: '#f3a712',
      motif: 'Tiger',
      imgMotif: '🐅'
    },
    {
      title: 'Paramapadham',
      tamilTitle: 'பரமபதம்',
      desc: 'Snakes and Ladders: Traverse the spiritual path of virtues (ladders) and avoid vice temptations (snakes) to reach Heaven.',
      type: 'paramapadham',
      color: '#90be6d',
      motif: 'Ladder',
      imgMotif: '🪜'
    },
    {
      title: 'Dayakattai',
      tamilTitle: 'தாயக்கட்டை',
      desc: 'The original race game played with brass sticks. Move 4 tokens home while cutting opponents and passing safe zones.',
      type: 'dayakattai',
      color: '#43aa8b',
      motif: 'Dice',
      imgMotif: '🎲'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }} className="animate-fade">
      
      {/* Hero Welcome banner */}
      <div 
        className="glass" 
        style={{
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          borderLeft: '8px solid var(--primary)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ zIndex: 2, flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--secondary)' }}>
            <Sparkles size={20} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              Welcome to {t('brand_title')}
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', color: 'var(--text-main)' }}>
            {language === 'en' ? 'Preserving Culture, ' : 'தமிழ் மரபு, ' }
            <span style={{ color: 'var(--primary)' }}>{language === 'en' ? 'One Turn at a Time' : 'விளையாட்டில் என்றும்!' }</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '650px' }}>
            {t('welcome_desc')}
          </p>
        </div>

        {/* User Stats Card */}
        {user ? (
          <div 
            className="wood-board" 
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              color: '#fff',
              width: '320px',
              zIndex: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                🦁
              </div>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.username}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>{user.title}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{t('level')}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.level}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{t('xp')}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.xp} XP</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{t('coins')}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>🪙 {user.coins}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{t('wins')}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {Object.values(user.gameStats).reduce((acc, curr) => acc + curr.wins, 0)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="glass" 
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              width: '320px',
              zIndex: 2,
              textAlign: 'center',
              border: '1px dashed var(--border-color)'
            }}
          >
            <UserCheck size={36} style={{ color: 'var(--primary)', marginBottom: '0.6rem' }} />
            <h4 style={{ fontWeight: 'bold', marginBottom: '0.4rem' }}>{t('guest_mode')}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {t('guest_desc')}
            </p>
          </div>
        )}
      </div>

      {/* Gamification Dashboard Row */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        
        {/* Streak tracker */}
        <div className="glass" style={{ flex: '1 1 300px', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={32} style={{ color: 'var(--secondary)' }} />
            <div>
              <h4 style={{ fontWeight: 'bold' }}>{t('streak')}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'en' ? 'Log in daily to claim bigger coin rewards!' : 'தினமும் வருகை தந்து நாணயங்களை அள்ளுங்கள்!'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--secondary)', lineHeight: 1 }}>
              {streak} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('days')}</span>
            </div>
            <button
              onClick={handleClaimStreakReward}
              disabled={rewardClaimed}
              style={{
                marginTop: '0.4rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: rewardClaimed ? 'var(--border-color)' : 'var(--secondary)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: rewardClaimed ? 'default' : 'pointer'
              }}
            >
              {rewardClaimed ? <CheckSquare size={12} style={{ display: 'inline', marginRight: '2px' }} /> : null}
              {rewardClaimed ? 'Claimed' : t('claim_reward')}
            </button>
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="glass" style={{ flex: '2 1 500px', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--success)' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckSquare size={18} style={{ color: 'var(--success)' }} /> {t('daily_challenges')}
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {challenges.map(ch => (
              <div 
                key={ch.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.5rem 0.8rem', 
                  borderRadius: '8px', 
                  backgroundColor: ch.completed ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-app)',
                  border: ch.completed ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={ch.completed}
                    onChange={() => handleToggleChallenge(ch.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', textDecoration: ch.completed ? 'line-through' : 'none', color: ch.completed ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 500 }}>
                    {ch.text}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                  <Coins size={14} /> +{ch.coins}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Game Selection Dashboard Grid */}
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trophy size={22} style={{ color: 'var(--secondary)' }} /> {t('select_game')}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {games.map(game => (
          <GameCard
            key={game.type}
            title={game.title}
            tamilTitle={game.tamilTitle}
            desc={game.desc}
            type={game.type}
            color={game.color}
            imgMotif={game.imgMotif}
            onSelect={onSelectGame}
            stats={user ? user.gameStats[game.type as keyof typeof user.gameStats] : undefined}
          />
        ))}
      </div>

    </div>
  );
};
