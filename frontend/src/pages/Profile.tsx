import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Trophy, History, Shield, Calendar, Award } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, fetchHistory } = useAuth();
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchHistory(user.username)
        .then(data => {
          setHistory(data);
          setLoadingHistory(false);
        })
        .catch(err => {
          console.warn('Failed to load user history:', err);
          setLoadingHistory(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>Please log in to view your profile and achievements.</h3>
      </div>
    );
  }

  const totalPlayed = Object.values(user.gameStats).reduce((acc, curr) => acc + curr.played, 0);
  const totalWins = Object.values(user.gameStats).reduce((acc, curr) => acc + curr.wins, 0);
  const winRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

  // Chart calculation metrics
  const stats = [
    { name: 'Pallanguzhi', played: user.gameStats.pallanguzhi?.played || 0, wins: user.gameStats.pallanguzhi?.wins || 0, color: '#e55934' },
    { name: 'Aadu Puli', played: user.gameStats.aadupuli?.played || 0, wins: user.gameStats.aadupuli?.wins || 0, color: '#f3a712' },
    { name: 'Paramapadham', played: user.gameStats.paramapadham?.played || 0, wins: user.gameStats.paramapadham?.wins || 0, color: '#90be6d' },
    { name: 'Dayakattai', played: user.gameStats.dayakattai?.played || 0, wins: user.gameStats.dayakattai?.wins || 0, color: '#43aa8b' },
  ];

  // SVG Bar Chart dimensions
  const maxVal = Math.max(...stats.map(s => Math.max(s.played, 1)), 5);
  const chartHeight = 120;
  const barWidth = 30;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }} className="animate-fade">
      
      {/* Bio / Level header */}
      <div className="glass" style={{ borderRadius: '16px', padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🦁
        </div>
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{user.username}</h2>
          <div style={{ color: 'var(--secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
            <Award size={18} /> {user.title}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('level')}</div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{user.level}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user.xp} XP total</div>
        </div>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        <div className="glass" style={metricCardStyle}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stat_played')}</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{totalPlayed}</span>
        </div>
        <div className="glass" style={metricCardStyle}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stat_won')}</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)' }}>{totalWins}</span>
        </div>
        <div className="glass" style={metricCardStyle}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stat_rate')}</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>{winRate}%</span>
        </div>
        <div className="glass" style={metricCardStyle}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stat_coins')}</span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>🪙 {user.coins}</span>
        </div>
      </div>

      {/* Responsive SVG Charts section */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        
        {/* Play count distribution SVG chart */}
        <div className="glass" style={{ flex: '1 1 400px', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1.2rem', alignSelf: 'flex-start' }}>
            {language === 'en' ? 'Game Activity Distribution' : 'விளையாட்டுப் பங்கீடு'}
          </h4>

          {totalPlayed === 0 ? (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No matches played to map chart activity.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Pie SVG */}
              <svg width="130" height="130" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', borderRadius: '50%' }}>
                {(() => {
                  let accumulatedPercent = 0;
                  return stats.map((s, idx) => {
                    const pct = totalPlayed > 0 ? (s.played / totalPlayed) * 100 : 0;
                    const strokeDash = `${pct} ${100 - pct}`;
                    const strokeOffset = 100 - accumulatedPercent;
                    accumulatedPercent += pct;
                    return pct > 0 ? (
                      <circle 
                        key={idx}
                        cx="16" 
                        cy="16" 
                        r="15.91549430918954" 
                        fill="transparent" 
                        stroke={s.color} 
                        strokeWidth="3.5" 
                        strokeDasharray={strokeDash} 
                        strokeDashoffset={strokeOffset} 
                      />
                    ) : null;
                  });
                })()}
              </svg>

              {/* Legends */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {stats.map((s, idx) => {
                  const pct = totalPlayed > 0 ? Math.round((s.played / totalPlayed) * 100) : 0;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: s.color }} />
                      <span style={{ fontWeight: 600 }}>{s.name}:</span>
                      <span style={{ color: 'var(--text-muted)' }}>{s.played} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Win ratio SVG Bar chart */}
        <div className="glass" style={{ flex: '1 1 400px', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1.2rem' }}>
            {language === 'en' ? 'Wins vs Plays Breakdown' : 'வெற்றி மற்றும் ஆட்டங்கள் ஒப்பீடு'}
          </h4>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '150px', width: '100%' }}>
            <svg width="100%" height="150" style={{ overflow: 'visible' }}>
              {stats.map((s, idx) => {
                const xPos = idx * 90 + 35;
                const playHeight = (s.played / maxVal) * chartHeight;
                const winHeight = (s.wins / maxVal) * chartHeight;

                return (
                  <g key={idx}>
                    {/* Background line grid */}
                    <line x1="0" y1={chartHeight} x2="350" y2={chartHeight} stroke="var(--border-color)" strokeWidth="1" />

                    {/* Total Played Bar (Gold) */}
                    <rect 
                      x={xPos} 
                      y={chartHeight - playHeight} 
                      width={barWidth} 
                      height={playHeight} 
                      fill="var(--secondary)" 
                      opacity="0.3"
                      rx="3" 
                    />

                    {/* Wins Bar (Primary/Red) */}
                    <rect 
                      x={xPos + 5} 
                      y={chartHeight - winHeight} 
                      width={barWidth - 10} 
                      height={winHeight} 
                      fill={s.color}
                      rx="3" 
                    />

                    {/* Labels under bars */}
                    <text 
                      x={xPos + barWidth / 2} 
                      y={chartHeight + 20} 
                      textAnchor="middle" 
                      fill="var(--text-muted)" 
                      fontSize="9" 
                      fontWeight="bold"
                    >
                      {s.name}
                    </text>

                    {/* Numbers over bars */}
                    <text 
                      x={xPos + barWidth / 2} 
                      y={chartHeight - playHeight - 6} 
                      textAnchor="middle" 
                      fill="var(--text-main)" 
                      fontSize="9" 
                      fontWeight="bold"
                    >
                      {s.played}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Game Breakdown list */}
        <div style={{ flex: '2 1 500px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={20} style={{ color: 'var(--secondary)' }} /> Game-by-Game Statistics
          </h3>

          <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  <th style={thStyle}>Game</th>
                  <th style={thStyle}>Played</th>
                  <th style={thStyle}>Wins</th>
                  <th style={thStyle}>Losses</th>
                  <th style={thStyle}>High Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(user.gameStats).map(([gameName, stats]) => (
                  <tr key={gameName} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}><strong style={{ textTransform: 'capitalize' }}>{gameName}</strong></td>
                    <td style={tdStyle}>{stats.played}</td>
                    <td style={tdStyle}>{stats.wins}</td>
                    <td style={tdStyle}>{stats.losses}</td>
                    <td style={tdStyle}>{stats.highScore || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Log */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={20} style={{ color: 'var(--primary)' }} /> {t('history_log')}
          </h3>

          {loadingHistory ? (
            <div>Loading match logs...</div>
          ) : history.length === 0 ? (
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches recorded yet. Play a game to log history!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {history.map(record => {
                const isWinner = record.winner === user.username;
                const isDraw = record.winner === 'Draw';
                return (
                  <div 
                    key={record.id || record._id} 
                    className="glass" 
                    style={{
                      padding: '0.8rem 1.2rem',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${isWinner ? 'var(--success)' : isDraw ? 'var(--secondary)' : 'var(--danger)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', textTransform: 'capitalize', fontSize: '0.95rem' }}>{record.gameType}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        vs {record.players.filter((p: string) => p !== user.username).join(', ')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isWinner ? 'var(--success)' : isDraw ? 'var(--secondary)' : 'var(--danger)' }}>
                        {isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const metricCardStyle = {
  padding: '1.2rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.2rem',
  boxShadow: 'var(--shadow-sm)',
};

const thStyle = {
  padding: '1rem',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: 'var(--text-muted)',
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.9rem',
};
