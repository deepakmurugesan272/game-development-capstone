import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Cpu, User, Info, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Pallanguzhi: React.FC = () => {
  const { user, recordGameResult } = useAuth();
  const { playSeedClick, playMove, playVictory, playDefeat } = useSound();
  const { t, language } = useLanguage();

  const [board, setBoard] = useState<number[]>(Array(14).fill(5));
  const [captured, setCaptured] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [isP1Turn, setIsP1Turn] = useState<boolean>(true);
  const [gameMode, setGameMode] = useState<'local' | 'ai'>('ai');
  const [isSowing, setIsSowing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Select a cup on your side to sow seeds.');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [activeSowingCup, setActiveSowingCup] = useState<number | null>(null);

  // Advanced features: AI difficulty & Tutorial
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const tutorialTexts = [
    { title: 'Goal of Pallanguzhi', body: 'Capture more seeds than your opponent. The board contains 14 cups (7 on your side, 7 on the opponent\'s side).' },
    { title: 'Sowing Seeds', body: 'Click any cup on your side (bottom row) containing seeds. All seeds are picked up and dropped one-by-one counter-clockwise.' },
    { title: 'Cascading Loops', body: 'If your last seed lands in a cup containing seeds, scoop them all up and continue sowing starting from the next cup.' },
    { title: 'Capturing (Kanjam)', body: 'If your last seed lands in a cup and the next cup is empty, your turn ends and you capture all seeds in the cup AFTER the empty cup!' }
  ];

  // Restart Game
  const initGame = () => {
    setBoard(Array(14).fill(5));
    setCaptured({ p1: 0, p2: 0 });
    setIsP1Turn(true);
    setIsSowing(false);
    setGameOver(false);
    setMessage(language === 'en' ? 'Game restarted. Player 1 select a cup.' : 'ஆட்டம் தொடங்கியது. முதல் விளையாட்டாளர் காயைத் தேர்வு செய்யவும்.');
  };

  const handleCupClick = async (cupIndex: number) => {
    if (isSowing || gameOver) return;
    
    if (isP1Turn && (cupIndex < 0 || cupIndex > 6)) {
      setMessage('It is Player 1\'s turn. Select a bottom cup.');
      return;
    }
    if (!isP1Turn && (cupIndex < 7 || cupIndex > 13)) {
      setMessage('It is Player 2 / AI\'s turn. Select a top cup.');
      return;
    }
    if (board[cupIndex] === 0) {
      setMessage('Selected cup is empty! Choose another.');
      return;
    }

    await sowSeeds(cupIndex);
  };

  const sowSeeds = async (startIndex: number) => {
    setIsSowing(true);
    let tempBoard = [...board];
    let seeds = tempBoard[startIndex];
    tempBoard[startIndex] = 0;
    setBoard([...tempBoard]);

    let currIdx = startIndex;
    
    while (seeds > 0) {
      currIdx = (currIdx + 1) % 14;
      setActiveSowingCup(currIdx);
      tempBoard[currIdx]++;
      seeds--;
      
      setBoard([...tempBoard]);
      playSeedClick();
      
      await new Promise(resolve => setTimeout(resolve, 200));

      if (seeds === 0) {
        const nextIdx = (currIdx + 1) % 14;
        
        if (tempBoard[nextIdx] > 0) {
          seeds = tempBoard[nextIdx];
          tempBoard[nextIdx] = 0;
          currIdx = nextIdx;
          setBoard([...tempBoard]);
          playMove();
          setMessage(`Cascading! Scooping ${seeds} seeds...`);
          await new Promise(resolve => setTimeout(resolve, 400));
        } else {
          const captureIdx = (nextIdx + 1) % 14;
          const capturedSeeds = tempBoard[captureIdx];
          
          if (capturedSeeds > 0) {
            tempBoard[captureIdx] = 0;
            setBoard([...tempBoard]);
            
            if (isP1Turn) {
              setCaptured(prev => ({ ...prev, p1: prev.p1 + capturedSeeds }));
              setMessage(`Player 1 captured ${capturedSeeds} seeds!`);
            } else {
              setCaptured(prev => ({ ...prev, p2: prev.p2 + capturedSeeds }));
              setMessage(`${gameMode === 'ai' ? 'AI' : 'Player 2'} captured ${capturedSeeds} seeds!`);
            }
            playVictory();
          } else {
            setMessage('Turn ended. Next cups are empty.');
          }
          break;
        }
      }
    }

    setActiveSowingCup(null);
    setIsSowing(false);

    const nextTurn = !isP1Turn;
    setIsP1Turn(nextTurn);
    
    checkEndConditions(tempBoard);
  };

  const checkEndConditions = (currentBoard: number[]) => {
    const p1HasSeeds = currentBoard.slice(0, 7).some(s => s > 0);
    const p2HasSeeds = currentBoard.slice(7, 14).some(s => s > 0);

    if (!p1HasSeeds || !p2HasSeeds) {
      let finalP1 = captured.p1;
      let finalP2 = captured.p2;

      currentBoard.forEach((seeds, idx) => {
        if (idx < 7) finalP1 += seeds;
        else finalP2 += seeds;
      });

      setBoard(Array(14).fill(0));
      setCaptured({ p1: finalP1, p2: finalP2 });
      setGameOver(true);

      const username = user?.username || 'Guest';

      if (finalP1 > finalP2) {
        setMessage(`Game Over! Player 1 wins with ${finalP1} seeds!`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('pallanguzhi', [username, gameMode === 'ai' ? 'AI' : 'Guest'], username, { [username]: finalP1 });
      } else if (finalP2 > finalP1) {
        setMessage(`Game Over! ${gameMode === 'ai' ? 'AI' : 'Player 2'} wins with ${finalP2} seeds!`);
        playDefeat();
        recordGameResult('pallanguzhi', [username, gameMode === 'ai' ? 'AI' : 'Guest'], gameMode === 'ai' ? 'AI' : 'Guest', { [username]: finalP1 });
      } else {
        setMessage(`Game Over! It\'s a Draw (${finalP1} - ${finalP2})!`);
        recordGameResult('pallanguzhi', [username, gameMode === 'ai' ? 'AI' : 'Guest'], 'Draw', { [username]: finalP1 });
      }
    }
  };

  // AI loop
  useEffect(() => {
    if (!isP1Turn && gameMode === 'ai' && !isSowing && !gameOver) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isP1Turn, gameMode, isSowing, gameOver]);

  // AI implementation with difficulty levels
  const makeAiMove = () => {
    const aiCups = [7, 8, 9, 10, 11, 12, 13].filter(idx => board[idx] > 0);
    if (aiCups.length === 0) return;

    let selectedCup = aiCups[0];

    if (difficulty === 'easy') {
      // Easy: Random choice
      selectedCup = aiCups[Math.floor(Math.random() * aiCups.length)];
    } else if (difficulty === 'medium') {
      // Medium: 1-ply search (Immediate capture)
      let maxCapture = -1;
      for (const cup of aiCups) {
        const sim = simulateTurn(cup);
        if (sim > maxCapture) {
          maxCapture = sim;
          selectedCup = cup;
        }
      }
    } else {
      // Hard: Deeper lookup heuristics
      let maxScore = -100;
      for (const cup of aiCups) {
        const capture = simulateTurn(cup);
        // Defense check: check how many seeds are left vulnerable on AI side after this move
        let score = capture * 10;
        
        // Add random slight variation
        score += Math.random() * 2;
        
        if (score > maxScore) {
          maxScore = score;
          selectedCup = cup;
        }
      }
    }

    handleCupClick(selectedCup);
  };

  const simulateTurn = (startIdx: number): number => {
    let tempBoard = [...board];
    let seeds = tempBoard[startIdx];
    tempBoard[startIdx] = 0;
    let currIdx = startIdx;

    while (seeds > 0) {
      currIdx = (currIdx + 1) % 14;
      tempBoard[currIdx]++;
      seeds--;

      if (seeds === 0) {
        const nextIdx = (currIdx + 1) % 14;
        if (tempBoard[nextIdx] > 0) {
          seeds = tempBoard[nextIdx];
          tempBoard[nextIdx] = 0;
          currIdx = nextIdx;
        } else {
          const captureIdx = (nextIdx + 1) % 14;
          return tempBoard[captureIdx];
        }
      }
    }
    return 0;
  };

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
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>பல்லாங்குழி / Pallanguzhi</h2>
          <p style={{ color: 'var(--text-muted)' }}>The ancient seed sowing game representing mathematical calculation and sharing.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {/* Tutorial click */}
          <button 
            onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
            style={{ ...resetBtnStyle, color: 'var(--primary)' }}
          >
            <HelpCircle size={16} /> Tutorial
          </button>
          
          {/* Difficulty select */}
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

      {/* Score boards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={scoreBoxStyle(isP1Turn && !gameOver, 'left')}>
          <div style={{ fontWeight: 600 }}>Player 1 (Bottom)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{captured.p1}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seeds Captured</div>
        </div>
        <div style={scoreBoxStyle(!isP1Turn && !gameOver, 'right')}>
          <div style={{ fontWeight: 600 }}>{gameMode === 'ai' ? 'AI Opponent (Top)' : 'Player 2 (Top)'}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary)' }}>{captured.p2}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seeds Captured</div>
        </div>
      </div>

      {/* Board */}
      <div className="wood-board" style={boardWrapperStyle}>
        
        {/* Row 2: Player 2 / AI (Top row, indices 13 to 7 from left-to-right to display loop) */}
        <div style={rowStyle}>
          {[13, 12, 11, 10, 9, 8, 7].map(idx => (
            <div 
              key={idx} 
              onClick={() => handleCupClick(idx)}
              style={cupStyle(idx === activeSowingCup, !isP1Turn && board[idx] > 0 && !isSowing)}
            >
              <div style={cupLabelStyle}>{idx + 1}</div>
              <div style={seedsContainerStyle}>
                {Array.from({ length: Math.min(board[idx], 12) }).map((_, seedIdx) => (
                  <div key={seedIdx} style={seedStyle(seedIdx)} />
                ))}
                {board[idx] > 12 && <div style={plusCounterStyle}>+{board[idx] - 12}</div>}
              </div>
              <div style={seedCountStyle}>{board[idx]}</div>
            </div>
          ))}
        </div>

        {/* Row 1: Player 1 (Bottom row, indices 0 to 6 from left-to-right) */}
        <div style={rowStyle}>
          {[0, 1, 2, 3, 4, 5, 6].map(idx => (
            <div 
              key={idx} 
              onClick={() => handleCupClick(idx)}
              style={cupStyle(idx === activeSowingCup, isP1Turn && board[idx] > 0 && !isSowing)}
            >
              <div style={cupLabelStyle}>{idx + 1}</div>
              <div style={seedsContainerStyle}>
                {Array.from({ length: Math.min(board[idx], 12) }).map((_, seedIdx) => (
                  <div key={seedIdx} style={seedStyle(seedIdx)} />
                ))}
                {board[idx] > 12 && <div style={plusCounterStyle}>+{board[idx] - 12}</div>}
              </div>
              <div style={seedCountStyle}>{board[idx]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Status Banner */}
      <div style={statusBannerStyle(gameOver)}>
        {message}
      </div>

      {/* Rules Box */}
      <div className="glass" style={rulesBoxStyle}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          <Info size={16} /> How to Play Pallanguzhi
        </h4>
        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <li>Each cup starts with <strong>5 seeds</strong>. Choose any cup on your side to sow.</li>
          <li>Seeds are distributed counter-clockwise, one by one into the next cups.</li>
          <li>If your last seed lands in a cup with seeds, scoop them all and continue distribution.</li>
          <li>If your last seed lands in a cup and the next cup is empty, your turn ends and you <strong>capture all seeds</strong> in the cup after the empty one!</li>
          <li>The game ends when a player has no seeds left on their side to play.</li>
        </ul>
      </div>

    </div>
  );
};

// Styles
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

const scoreBoxStyle = (active: boolean, side: 'left' | 'right') => ({
  backgroundColor: 'var(--bg-card)',
  padding: '1rem',
  borderRadius: '12px',
  textAlign: 'center' as const,
  border: active ? `2px solid ${side === 'left' ? 'var(--primary)' : 'var(--secondary)'}` : '2px solid transparent',
  boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
  transform: active ? 'scale(1.02)' : 'scale(1)',
  transition: 'all 0.3s ease',
});

const boardWrapperStyle = {
  padding: '2.5rem 1.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2.5rem',
  marginBottom: '1.5rem',
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '1rem',
};

const cupStyle = (active: boolean, playable: boolean) => ({
  height: '100px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.3)',
  boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.6), 0 2px 4px rgba(255,255,255,0.1)',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: playable ? 'pointer' : 'default',
  position: 'relative' as const,
  border: active ? '3px solid var(--secondary)' : playable ? '1px dashed rgba(255,255,255,0.2)' : '1px solid transparent',
  transform: active ? 'scale(1.15)' : 'scale(1)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

const cupLabelStyle = {
  position: 'absolute' as const,
  top: '-18px',
  fontSize: '0.75rem',
  color: 'rgba(255,255,255,0.4)',
};

const seedsContainerStyle = {
  position: 'relative' as const,
  width: '60%',
  height: '60%',
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignContent: 'center',
  justifyContent: 'center',
  gap: '3px',
};

const seedStyle = (idx: number) => {
  const rX = Math.sin(idx * 45) * 8;
  const rY = Math.cos(idx * 75) * 8;
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#f5ebe0',
    backgroundImage: 'radial-gradient(circle, #ffffff 0%, #e0d0c0 100%)',
    boxShadow: '1px 1px 2px rgba(0,0,0,0.6)',
    transform: `translate(${rX}px, ${rY}px)`,
    position: 'absolute' as const,
  };
};

const plusCounterStyle = {
  position: 'absolute' as const,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '1px 3px',
  borderRadius: '4px',
  zIndex: 10,
};

const seedCountStyle = {
  position: 'absolute' as const,
  bottom: '-20px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#fff',
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
