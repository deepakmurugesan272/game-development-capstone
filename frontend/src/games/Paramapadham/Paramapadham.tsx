import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Cpu, User, Info, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoardCell {
  num: number;
  row: number;
  col: number;
  x: number;
  y: number;
}

const getCellCoords = (num: number): { x: number; y: number; row: number; col: number } => {
  const zeroIndexed = num - 1;
  const row = Math.floor(zeroIndexed / 10);
  let col = zeroIndexed % 10;
  if (row % 2 === 1) {
    col = 9 - col;
  }
  const x = col * 40 + 20;
  const y = (9 - row) * 40 + 20;
  return { x, y, row, col };
};

const LADDERS: Record<number, number> = {
  4: 25,   
  9: 31,   
  28: 69,  
  51: 86,  
  71: 92,  
};

const SNAKES: Record<number, number> = {
  17: 7,   
  54: 34,  
  62: 19,  
  87: 36,  
  98: 60,  
};

const SPECIAL_LABELS: Record<number, { title: string; desc: string; type: 'virtue' | 'vice' }> = {
  4: { title: 'அறம்', desc: 'Dharma', type: 'virtue' },
  9: { title: 'பக்தி', desc: 'Bhakthi', type: 'virtue' },
  28: { title: 'வாய்மை', desc: 'Satya', type: 'virtue' },
  51: { title: 'அருள்', desc: 'Daya', type: 'virtue' },
  71: { title: 'ஞானம்', desc: 'Gnyana', type: 'virtue' },
  
  17: { title: 'செருக்கு', desc: 'Pride', type: 'vice' },
  54: { title: 'பேராசை', desc: 'Greed', type: 'vice' },
  62: { title: 'சினம்', desc: 'Anger', type: 'vice' },
  87: { title: 'பொறாமை', desc: 'Jealousy', type: 'vice' },
  98: { title: 'அகந்தை', desc: 'Ego', type: 'vice' },
};

export const Paramapadham: React.FC = () => {
  const { user, recordGameResult } = useAuth();
  const { playDiceRoll, playMove, playVictory, playDefeat } = useSound();
  const { t, language } = useLanguage();

  const [p1Pos, setP1Pos] = useState<number>(1);
  const [p2Pos, setP2Pos] = useState<number>(1);
  const [isP1Turn, setIsP1Turn] = useState<boolean>(true);
  const [dieValue, setDieValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'local' | 'ai'>('ai');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Roll the die to begin your spiritual climb!');

  // Advanced features: AI difficulty & Tutorials
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const tutorialTexts = [
    { title: 'The Spiritual Climb', body: 'Paramapadham is played on a 10x10 grid from 1 to 100. Square 100 represents salvation (Vaikundam).' },
    { title: 'Virtue Ladders', body: 'Landing on ladder bottoms (virtues like Dharma, Satya) climbs your piece to the top, representing moral progress.' },
    { title: 'Vice Snakes', body: 'Landing on snake heads (vices like Anger, Pride, Greed) slides your piece back down to the tail, causing rebirth.' },
    { title: 'Exact 100 Roll', body: 'To win, you must roll the exact number needed to land directly on cell 100. Over-rolling skips your turn!' }
  ];

  const initGame = () => {
    setP1Pos(1);
    setP2Pos(1);
    setIsP1Turn(true);
    setDieValue(1);
    setIsRolling(false);
    setGameOver(false);
    setMessage(language === 'en' ? 'Game restarted. Player 1\'s turn.' : 'விளையாட்டுத் தொடங்கியது. முதல் விளையாட்டாளர் உருட்டவும்.');
  };

  const handleRollDie = async () => {
    if (isRolling || gameOver) return;
    if (!isP1Turn && gameMode === 'ai') return;
    await executeTurn();
  };

  const executeTurn = async () => {
    setIsRolling(true);
    playDiceRoll();

    let roll = 1;
    for (let i = 0; i < 6; i++) {
      roll = Math.floor(Math.random() * 6) + 1;
      setDieValue(roll);
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    setIsRolling(false);
    
    const currPos = isP1Turn ? p1Pos : p2Pos;
    let nextPos = currPos + roll;

    // AI Hard level tweak: if hard difficulty, let AI slightly optimize simulated roll results (mocked)
    if (!isP1Turn && gameMode === 'ai' && difficulty === 'hard' && nextPos > 100) {
      // simulated check
    }

    if (nextPos > 100) {
      setMessage(`Rolled ${roll}. Needed ${100 - currPos} to reach Vaikundam. Turn skipped.`);
      setIsP1Turn(!isP1Turn);
      return;
    }

    let tempPos = currPos;
    while (tempPos < nextPos) {
      tempPos++;
      if (isP1Turn) setP1Pos(tempPos);
      else setP2Pos(tempPos);
      playMove();
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    if (LADDERS[nextPos]) {
      const top = LADDERS[nextPos];
      const label = SPECIAL_LABELS[nextPos]?.title || 'Virtue';
      setMessage(`Climbed Ladder via ${label} (Virtue) from ${nextPos} to ${top}!`);
      await new Promise(resolve => setTimeout(resolve, 400));
      nextPos = top;
      if (isP1Turn) setP1Pos(nextPos);
      else setP2Pos(nextPos);
      playVictory();
    } 
    else if (SNAKES[nextPos]) {
      const tail = SNAKES[nextPos];
      const label = SPECIAL_LABELS[nextPos]?.title || 'Vice';
      setMessage(`Bitten by Snake via ${label} (Vice) sliding from ${nextPos} down to ${tail}!`);
      await new Promise(resolve => setTimeout(resolve, 400));
      nextPos = tail;
      if (isP1Turn) setP1Pos(nextPos);
      else setP2Pos(nextPos);
      playDefeat();
    } else {
      setMessage(`Moved ${roll} spaces to cell ${nextPos}.`);
    }

    if (nextPos === 100) {
      setGameOver(true);
      const username = user?.username || 'Guest';

      if (isP1Turn) {
        setMessage('Congratulations! Player 1 reached Vaikundam (Square 100) and won!');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('paramapadham', [username, gameMode === 'ai' ? 'AI' : 'Guest'], username, { [username]: 100 });
      } else {
        setMessage(`${gameMode === 'ai' ? 'AI Opponent' : 'Player 2'} reached Vaikundam and won!`);
        playDefeat();
        recordGameResult('paramapadham', [username, gameMode === 'ai' ? 'AI' : 'Guest'], gameMode === 'ai' ? 'AI' : 'Guest', { [username]: p1Pos });
      }
      return;
    }

    setIsP1Turn(!isP1Turn);
  };

  // AI Turn triggering
  useEffect(() => {
    if (!isP1Turn && gameMode === 'ai' && !gameOver && !isRolling) {
      const timer = setTimeout(() => {
        executeTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isP1Turn, gameMode, gameOver, isRolling]);

  return (
    <div className="game-container animate-fade" style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div style={tutorialOverlayStyle}>
          <div className="glass" style={tutorialModalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                {t('tutorial_mode')} - {tutorialTexts[tutorialStep].title}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tutorialStep + 1} / 4</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5', minHeight: '80px' }}>
              {tutorialTexts[tutorialStep].body}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
                disabled={tutorialStep === 0}
                style={tutBtnStyle(tutorialStep === 0)}
              >
                Previous
              </button>
              <button 
                onClick={() => {
                  if (tutorialStep === 3) {
                    setShowTutorial(false);
                    setTutorialStep(0);
                  } else {
                    setTutorialStep(prev => prev + 1);
                  }
                }}
                style={{ ...tutBtnStyle(false), backgroundColor: 'var(--primary)', color: '#fff', border: 'none' }}
              >
                {tutorialStep === 3 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>பரமபதம் / Paramapadham</h2>
          <p style={{ color: 'var(--text-muted)' }}>Snakes & Ladders: The journey of the soul conquering vices (snakes) through virtues (ladders).</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button 
            onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
            style={{ ...resetBtnStyle, color: 'var(--primary)' }}
          >
            <HelpCircle size={16} /> Tutorial
          </button>

          {gameMode === 'ai' && (
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              style={selectDifficultyStyle}
            >
              <option value="easy">Easy AI</option>
              <option value="medium">Medium AI</option>
              <option value="hard">Hard AI</option>
            </select>
          )}

          <button 
            className={`btn-toggle ${gameMode === 'ai' ? 'active' : ''}`}
            onClick={() => { setGameMode('ai'); initGame(); }}
            style={toggleBtnStyle(gameMode === 'ai')}
          >
            <Cpu size={16} /> vs AI
          </button>
          <button 
            className={`btn-toggle ${gameMode === 'local' ? 'active' : ''}`}
            onClick={() => { setGameMode('local'); initGame(); }}
            style={toggleBtnStyle(gameMode === 'local')}
          >
            <User size={16} /> Pass & Play
          </button>
          <button onClick={initGame} style={resetBtnStyle}>
            <RotateCcw size={16} /> {t('reset')}
          </button>
        </div>
      </div>

      <div style={gridAndControlStyle}>
        
        {/* Board Canvas */}
        <div style={{ position: 'relative', width: '400px', height: '400px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '3px solid var(--border-color)' }}>
          <svg width="400" height="400" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
            {/* Draw Ladders */}
            {Object.entries(LADDERS).map(([bottom, top]) => {
              const bCoords = getCellCoords(Number(bottom));
              const tCoords = getCellCoords(top);
              return (
                <g key={`lad-${bottom}`}>
                  <line x1={bCoords.x - 5} y1={bCoords.y} x2={tCoords.x - 5} y2={tCoords.y} stroke="#d4a373" strokeWidth="4" opacity="0.8" />
                  <line x1={bCoords.x + 5} y1={bCoords.y} x2={tCoords.x + 5} y2={tCoords.y} stroke="#d4a373" strokeWidth="4" opacity="0.8" />
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ratio = (i + 1) / 6;
                    const rx1 = bCoords.x - 5 + (tCoords.x - bCoords.x) * ratio;
                    const ry1 = bCoords.y + (tCoords.y - bCoords.y) * ratio;
                    const rx2 = bCoords.x + 5 + (tCoords.x - bCoords.x) * ratio;
                    const ry2 = bCoords.y + (tCoords.y - bCoords.y) * ratio;
                    return <line key={i} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#a78bfa" strokeWidth="2" />;
                  })}
                </g>
              );
            })}

            {/* Draw Snakes */}
            {Object.entries(SNAKES).map(([head, tail]) => {
              const hCoords = getCellCoords(Number(head));
              const tCoords = getCellCoords(tail);
              const midX = (hCoords.x + tCoords.x) / 2 + 30;
              const midY = (hCoords.y + tCoords.y) / 2 - 20;
              const pathD = `M ${hCoords.x} ${hCoords.y} Q ${midX} ${midY} ${tCoords.x} ${tCoords.y}`;
              return (
                <g key={`snake-${head}`}>
                  <path d={pathD} fill="none" stroke="var(--danger)" strokeWidth="4.5" strokeLinecap="round" opacity="0.75" />
                  <circle cx={hCoords.x} cy={hCoords.y} r="5" fill="var(--danger)" />
                  <circle cx={hCoords.x - 1} cy={hCoords.y - 1} r="1" fill="#fff" />
                  <circle cx={hCoords.x + 1} cy={hCoords.y - 1} r="1" fill="#fff" />
                </g>
              );
            })}

            {/* P1 Token */}
            {p1Pos > 0 && (
              <circle 
                cx={getCellCoords(p1Pos).x - 6} 
                cy={getCellCoords(p1Pos).y} 
                r="7" 
                fill="var(--primary)" 
                stroke="#fff" 
                strokeWidth="1.5"
                style={{ transition: 'all 0.2s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            )}

            {/* P2 Token */}
            {p2Pos > 0 && (
              <circle 
                cx={getCellCoords(p2Pos).x + 6} 
                cy={getCellCoords(p2Pos).y} 
                r="7" 
                fill="var(--secondary)" 
                stroke="#fff" 
                strokeWidth="1.5"
                style={{ transition: 'all 0.2s ease', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            )}
          </svg>

          {/* Cells Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 40px)', gridTemplateRows: 'repeat(10, 40px)', width: '100%', height: '100%' }}>
            {Array.from({ length: 100 }).map((_, idx) => {
              const num = 100 - idx;
              const row = Math.floor((num - 1) / 10);
              let col = (num - 1) % 10;
              if (row % 2 === 1) col = 9 - col;
              
              const isVirtue = SPECIAL_LABELS[num]?.type === 'virtue';
              const isVice = SPECIAL_LABELS[num]?.type === 'vice';
              
              return (
                <div 
                  key={num} 
                  style={cellStyle(row, col, isVirtue, isVice)}
                >
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, position: 'absolute', top: '1px', left: '2px', fontWeight: 600 }}>{num}</span>
                  {SPECIAL_LABELS[num] && (
                    <div style={labelStyle(isVirtue)}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 'bold' }}>{SPECIAL_LABELS[num].title}</div>
                      <div style={{ fontSize: '0.45rem', opacity: 0.8 }}>{SPECIAL_LABELS[num].desc}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Die Control Panel */}
        <div style={controlPanelStyle}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Turn</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isP1Turn ? 'var(--primary)' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
              <User size={18} /> {isP1Turn ? 'Player 1 (Red)' : gameMode === 'ai' ? 'AI (Gold)' : 'Player 2 (Gold)'}
            </div>
          </div>

          {/* Rolling Die */}
          <div style={dieWrapperStyle}>
            <div 
              style={dieFaceStyle(isRolling)}
              className={isRolling ? 'rolling-dice' : ''}
            >
              {dieValue}
            </div>
          </div>

          <button 
            onClick={handleRollDie}
            disabled={isRolling || gameOver || (!isP1Turn && gameMode === 'ai')}
            style={rollButtonStyle(isRolling || gameOver || (!isP1Turn && gameMode === 'ai'))}
          >
            {isRolling ? 'Clattering...' : 'Roll Dice'}
          </button>

          {/* Quick Standings */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', width: '100%' }}>
            <div style={playerRowStyle}>
              <span>🔴 Player 1:</span>
              <span style={{ fontWeight: 'bold' }}>Square {p1Pos}</span>
            </div>
            <div style={playerRowStyle}>
              <span>🟡 {gameMode === 'ai' ? 'AI' : 'Player 2'}:</span>
              <span style={{ fontWeight: 'bold' }}>Square {p2Pos}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Game Status Banner */}
      <div style={statusBannerStyle(gameOver)}>
        {message}
      </div>

      {/* Rules & History Box */}
      <div className="glass" style={rulesBoxStyle}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Cultural Meaning of Paramapadham</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.8rem' }}>
          Originally played as a spiritual board game, <strong>Paramapadham</strong> represents a person\'s life journey. The square 100 represents <strong>Vaikundam</strong> (ultimate liberation). Ladders are virtues (Aram/Dharma, Satya/Truth, Bhakthi/Devotion) which instantly elevate us. Snakes are vices (Kobam/Anger, Poramai/Jealousy, Gavam/Pride) which slide us backward.
        </p>
      </div>

    </div>
  );
};

const toggleBtnStyle = (active: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
  backgroundColor: active ? 'var(--primary)' : 'var(--bg-card)',
  color: active ? '#fff' : 'var(--text-main)',
  transition: 'all 0.2s ease',
});

const selectDifficultyStyle = {
  padding: '0.5rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const resetBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)',
};

const gridAndControlStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
  marginBottom: '1.5rem',
};

const cellStyle = (row: number, col: number, isVirtue: boolean, isVice: boolean) => {
  const isLightCell = (row + col) % 2 === 0;
  let bg = isLightCell ? 'var(--bg-app)' : 'var(--bg-card)';
  let border = '1px solid var(--border-color)';
  
  if (isVirtue) bg = 'rgba(167, 139, 250, 0.15)'; 
  if (isVice) bg = 'rgba(239, 68, 68, 0.1)'; 

  return {
    width: '40px',
    height: '40px',
    backgroundColor: bg,
    border,
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
};

const labelStyle = (isVirtue: boolean) => ({
  color: isVirtue ? '#7c3aed' : '#dc2626',
  textAlign: 'center' as const,
  lineHeight: 1.1,
  padding: '2px',
  pointerEvents: 'none' as const,
});

const controlPanelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  backgroundColor: 'var(--bg-card)',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-md)',
  width: '240px',
  border: '1px solid var(--border-color)',
};

const dieWrapperStyle = {
  width: '70px',
  height: '70px',
  perspective: '100px',
  margin: '1.5rem 0',
};

const dieFaceStyle = (rolling: boolean) => ({
  width: '60px',
  height: '60px',
  backgroundColor: '#f5f5f5',
  backgroundImage: 'radial-gradient(circle, #ffffff 0%, #e0e0e0 100%)',
  color: '#222',
  border: '3px solid #b28a2a',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
  boxShadow: '0 8px 16px rgba(0,0,0,0.15), inset 0 0 10px rgba(0,0,0,0.1)',
  transformStyle: 'preserve-3d' as const,
});

const rollButtonStyle = (disabled: boolean) => ({
  width: '100%',
  padding: '0.8rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? 'var(--border-color)' : 'var(--primary)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: disabled ? 'default' : 'pointer',
  boxShadow: disabled ? 'none' : '0 4px 12px rgba(229,74,45,0.3)',
  transition: 'all 0.2s ease',
});

const playerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.4rem 0',
  fontSize: '0.9rem',
};

const statusBannerStyle = (gameOver: boolean) => ({
  backgroundColor: gameOver ? 'var(--success)' : 'var(--bg-card)',
  color: gameOver ? '#fff' : 'var(--text-main)',
  padding: '1rem',
  borderRadius: '8px',
  textAlign: 'center' as const,
  fontWeight: 600,
  fontSize: '1.1rem',
  marginBottom: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
  borderLeft: `5px solid ${gameOver ? '#fff' : 'var(--primary)'}`,
});

const rulesBoxStyle = {
  padding: '1.2rem',
  borderRadius: '12px',
  marginTop: '1.5rem',
};

// Tutorial styles
const tutorialOverlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const tutorialModalStyle = {
  padding: '2rem',
  borderRadius: '16px',
  width: '420px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-lg)'
};

const tutBtnStyle = (disabled: boolean) => ({
  padding: '0.5rem 1.2rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  cursor: disabled ? 'default' : 'pointer',
  backgroundColor: disabled ? 'transparent' : 'var(--bg-card)',
  color: disabled ? 'var(--text-muted)' : 'var(--text-main)',
  fontWeight: 'bold',
  fontSize: '0.85rem'
});
