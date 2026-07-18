import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { fetchLeaderboard } = useAuth();
  const [standings, setStandings] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(selectedGame)
      .then(data => {
        setStandings(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to load leaderboard:', err);
        setLoading(false);
      });
  }, [selectedGame]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }} className="animate-fade">
      
      {/* Header filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy style={{ color: 'var(--secondary)' }} /> மதிப்பீட்டுப் பலகை / Leaderboards
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Top Tamil Heritage players ranked by experience (XP) and game wins.</p>
        </div>

        <div>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            style={selectStyle}
          >
            <option value="all">Global Ranking (XP)</option>
            <option value="pallanguzhi">Pallanguzhi Wins</option>
            <option value="aadupuli">Aadu Puli Aattam Wins</option>
            <option value="paramapadham">Paramapadham Wins</option>
            <option value="dayakattai">Dayakattai Wins</option>
          </select>
        </div>
      </div>

      {/* Standings table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading standings...</div>
      ) : standings.length === 0 ? (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '12px', color: 'var(--text-muted)' }}>
          No player records found.
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.05)', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1.2rem 1.5rem' }}>Rank</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Player</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Title</th>
                <th style={{ padding: '1.2rem 1.5rem' }}>Level</th>
                <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                  {selectedGame === 'all' ? 'Total XP' : 'Wins'}
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player) => {
                const isTop3 = player.rank <= 3;
                const rankColor = player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : 'var(--text-muted)';
                
                return (
                  <tr 
                    key={player.username} 
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: player.rank === 1 ? 'rgba(255, 215, 0, 0.03)' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {/* Rank Badge */}
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 'bold' }}>
                      {isTop3 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: rankColor, color: '#333', fontSize: '0.85rem' }}>
                          {player.rank}
                        </span>
                      ) : (
                        <span style={{ paddingLeft: '8px' }}>{player.rank}</span>
                      )}
                    </td>

                    {/* Username & Avatar */}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                          {player.username[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700 }}>{player.username}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      {player.title}
                    </td>

                    {/* Level */}
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>
                      Lv {player.level}
                    </td>

                    {/* Score / Wins */}
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--primary)' }}>
                      {selectedGame === 'all' ? `${player.xp} XP` : `${player.wins} Wins`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

const selectStyle = {
  padding: '0.5rem 1.5rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};
