import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Cpu, User, Info, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PathPos {
  row: number;
  col: number;
}

const boardCells = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24]
];

const SAFE_ZONES = [
  { row: 4, col: 2 }, 
  { row: 0, col: 2 }, 
  { row: 2, col: 0 }, 
  { row: 2, col: 4 }, 
  { row: 2, col: 2 }  
];

const isSafeCell = (row: number, col: number) => {
  return SAFE_ZONES.some(sz => sz.row === row && sz.col === col);
};

const P1_PATH: PathPos[] = [
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 3, col: 4 },
  { row: 2, col: 4 }, { row: 1, col: 4 }, { row: 0, col: 4 }, { row: 0, col: 3 },
  { row: 0, col: 2 }, { row: 0, col: 1 }, { row: 0, col: 0 }, { row: 1, col: 0 },
  { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 4, col: 1 },
  { row: 3, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 3, col: 2 },
  { row: 2, col: 2 } 
];

const P2_PATH: PathPos[] = [
  { row: 0, col: 2 }, { row: 0, col: 1 }, { row: 0, col: 0 }, { row: 1, col: 0 },
  { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 4, col: 1 },
  { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 3, col: 4 },
  { row: 2, col: 4 }, { row: 1, col: 4 }, { row: 0, col: 4 }, { row: 0, col: 3 },
  { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 3, col: 2 },
  { row: 3, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 2 } 
];

export const Dayakattai: React.FC = () => {
  const { user, recordGameResult } = useAuth();
  const { playDiceRoll, playMove, playVictory, playDefeat } = useSound();
  const { t, language } = useLanguage();

  const [p1Tokens, setP1Tokens] = useState<number[]>([-1, -1, -1, -1]);
  const [p2Tokens, setP2Tokens] = useState<number[]>([-1, -1, -1, -1]);
  
  const [p1HasCut, setP1HasCut] = useState<boolean>(false);
  const [p2HasCut, setP2HasCut] = useState<boolean>(false);

  const [isP1Turn, setIsP1Turn] = useState<boolean>(true);
  const [rollPool, setRollPool] = useState<number[]>([]); 
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [diceVisual, setDiceVisual] = useState<[number, number]>([0, 0]); 
  
  const [gameMode, setGameMode] = useState<'local' | 'ai'>('ai');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('P1 Roll phase: Roll the Dayakattai sticks!');
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);

  // Advanced features: AI difficulty & Tutorials
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const tutorialTexts = [
    { title: 'The Dayakattai Race', body: 'Each player has 4 tokens starting off-board. The goal is to navigate all 4 tokens around the board to the center HOME (2,2).' },
    { title: 'Dhaayam (1) Entry', body: 'Your tokens start in the pool. To enter a token onto the board starting safe zone, you must roll a Dhaayam (1).' },
    { title: 'Extra Rolls & Pools', body: 'Rolling a 1 (Dhaayam), 5, or 12 grants you an extra roll! Rolls accumulate in a pool for you to allocate.' },
    { title: 'Cutting & Safe Zones', body: 'Safe zones (✕) are safe. Landing on an opponent token elsewhere cuts it. You MUST cut at least one opponent token to enter the center HOME!' }
  ];

  const initGame = () => {
    setP1Tokens([-1, -1, -1, -1]);
    setP2Tokens([-1, -1, -1, -1]);
    setP1HasCut(false);
    setP2HasCut(false);
    setIsP1Turn(true);
    setRollPool([]);
    setIsRolling(false);
    setDiceVisual([0, 0]);
    setGameOver(false);
    setSelectedTokenIdx(null);
    setMessage('Game restarted. Player 1\'s roll phase.');
  };

  const handleRoll = async () => {
    if (isRolling || gameOver || rollPool.includes(2) || rollPool.includes(3) || rollPool.includes(4) || rollPool.includes(6)) {
      return;
    }
    if (!isP1Turn && gameMode === 'ai') return;
    await executeRoll();
  };

  const executeRoll = async () => {
    setIsRolling(true);
    playDiceRoll();

    let stick1 = 0;
    let stick2 = 0;
    for (let i = 0; i < 8; i++) {
      stick1 = Math.floor(Math.random() * 4); 
      stick2 = Math.floor(Math.random() * 4);
      setDiceVisual([stick1, stick2]);
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    let rollVal = 2;
    if (stick1 === 0 && stick2 === 0) rollVal = 1; 
    else if (stick1 === 3 && stick2 === 3) rollVal = 12; 
    else if (stick1 === 0 || stick2 === 0) {
      const nonZero = stick1 || stick2;
      rollVal = nonZero === 3 ? 5 : nonZero === 2 ? 3 : 2; 
    } else {
      rollVal = stick1 + stick2;
    }

    const validRolls = [1, 2, 3, 4, 5, 6, 12];
    if (!validRolls.includes(rollVal)) rollVal = 2; 

    const newPool = [...rollPool, rollVal];
    setRollPool(newPool);
    setIsRolling(false);

    const extraRoll = rollVal === 1 || rollVal === 5 || rollVal === 12;

    if (extraRoll) {
      setMessage(`Rolled a ${rollVal === 1 ? 'Dhaayam (1)' : rollVal}! You earned an EXTRA roll.`);
    } else {
      setMessage(`Rolled a ${rollVal}. Now select a token and a move from your pool.`);
      
      const hasMoves = checkValidMoves(newPool);
      if (!hasMoves) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage('No legal moves available. Turn passed.');
        setRollPool([]);
        setIsP1Turn(!isP1Turn);
      }
    }
  };

  const checkValidMoves = (pool: number[]): boolean => {
    const tokens = isP1Turn ? p1Tokens : p2Tokens;
    const hasCut = isP1Turn ? p1HasCut : p2HasCut;
    const pathLen = P1_PATH.length;

    for (const val of pool) {
      for (let i = 0; i < 4; i++) {
        const pos = tokens[i];
        if (pos === -1) {
          if (val === 1) return true;
        } else if (pos < pathLen - 1) {
          const targetPos = pos + val;
          if (targetPos < pathLen) {
            if (targetPos >= 16 && pos < 16 && !hasCut) {
              continue;
            }
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleTokenClick = (player: 1 | 2, tokenIdx: number) => {
    if (gameOver || isRolling) return;
    if (isP1Turn && player !== 1) return;
    if (!isP1Turn && player !== 2) return;
    if (!isP1Turn && gameMode === 'ai') return;

    if (rollPool.length === 0) {
      setMessage('You must roll the sticks first!');
      return;
    }

    setSelectedTokenIdx(tokenIdx);
    setMessage(`Selected Token ${tokenIdx + 1}. Select which roll to use.`);
  };

  const handleMoveToken = async (rollVal: number) => {
    if (selectedTokenIdx === null || gameOver) return;

    const tokens = isP1Turn ? p1Tokens : p2Tokens;
    const path = isP1Turn ? P1_PATH : P2_PATH;
    const currPos = tokens[selectedTokenIdx];

    let targetPos = -1;

    if (currPos === -1) {
      if (rollVal === 1) {
        targetPos = 0; 
      } else {
        setMessage('Tokens in starting pool can only enter on a roll of 1 (Dhaayam).');
        return;
      }
    } else {
      targetPos = currPos + rollVal;
    }

    if (targetPos >= path.length) {
      setMessage('Move exceeds the Home limit.');
      return;
    }

    const hasCut = isP1Turn ? p1HasCut : p2HasCut;
    if (targetPos >= 16 && currPos < 16 && !hasCut) {
      setMessage('Cannot enter inner loop or Home without cutting at least one opponent token first!');
      return;
    }

    let newTokens = [...tokens];
    newTokens[selectedTokenIdx] = targetPos;

    if (isP1Turn) {
      setP1Tokens(newTokens);
    } else {
      setP2Tokens(newTokens);
    }
    playMove();

    const indexInPool = rollPool.indexOf(rollVal);
    const updatedPool = [...rollPool];
    updatedPool.splice(indexInPool, 1);
    setRollPool(updatedPool);
    setSelectedTokenIdx(null);

    const targetCell = path[targetPos];
    const opponent = isP1Turn ? 2 : 1;
    const oppTokens = opponent === 1 ? p1Tokens : p2Tokens;
    const oppPath = opponent === 1 ? P1_PATH : P2_PATH;
    const cellIsSafe = isSafeCell(targetCell.row, targetCell.col);

    if (!cellIsSafe) {
      let cutIndex = -1;
      for (let i = 0; i < 4; i++) {
        const oppPos = oppTokens[i];
        if (oppPos !== -1) {
          const oppCell = oppPath[oppPos];
          if (oppCell.row === targetCell.row && oppCell.col === targetCell.col) {
            cutIndex = i;
            break;
          }
        }
      }

      if (cutIndex !== -1) {
        let newOppTokens = [...oppTokens];
        newOppTokens[cutIndex] = -1; 

        if (opponent === 1) {
          setP1Tokens(newOppTokens);
        } else {
          setP2Tokens(newOppTokens);
          setP1HasCut(true); 
          setMessage(`BAM! Player 1 cut Player 2's Token! Enter-Inner path unlocked.`);
        }

        if (opponent === 2) {
          setP2HasCut(true); 
          setMessage(`BAM! ${gameMode === 'ai' ? 'AI' : 'Player 2'} cut Player 1's Token!`);
        }

        playDefeat(); 
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    const allHome = newTokens.every(pos => pos === path.length - 1);
    if (allHome) {
      setGameOver(true);
      const username = user?.username || 'Guest';

      if (isP1Turn) {
        setMessage('CONGRATULATIONS! You successfully navigated all tokens home and won Dayakattai!');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('dayakattai', [username, gameMode === 'ai' ? 'AI' : 'Guest'], username, { [username]: 4 });
      } else {
        setMessage(`Game Over! ${gameMode === 'ai' ? 'AI' : 'Player 2'} successfully reached home first!`);
        playDefeat();
        recordGameResult('dayakattai', [username, gameMode === 'ai' ? 'AI' : 'Guest'], gameMode === 'ai' ? 'AI' : 'Guest', { [username]: newTokens.filter(t => t === 23).length });
      }
      return;
    }

    if (updatedPool.length === 0) {
      setIsP1Turn(!isP1Turn);
      setMessage(isP1Turn 
        ? `${gameMode === 'ai' ? 'AI' : 'Player 2'} Roll phase.` 
        : 'Player 1 Roll phase.'
      );
    } else {
      const hasMoves = checkValidMoves(updatedPool);
      if (!hasMoves) {
        setMessage('No remaining legal moves with pool. Turn passed.');
        setRollPool([]);
        setIsP1Turn(!isP1Turn);
      } else {
        setMessage('Select another token to use the remaining rolls.');
      }
    }
  };

  // AI loop
  useEffect(() => {
    if (gameOver || isRolling) return;

    if (!isP1Turn && gameMode === 'ai') {
      const timer = setTimeout(() => {
        executeAiTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isP1Turn, gameMode, gameOver, rollPool, isRolling]);

  const executeAiTurn = async () => {
    if (rollPool.length === 0) {
      await executeRoll();
      return;
    }

    const hasCut = p2HasCut;
    const path = P2_PATH;
    const oppPath = P1_PATH;

    let bestMove: { tokenIdx: number; rollVal: number; score: number } | null = null;

    for (const val of rollPool) {
      for (let i = 0; i < 4; i++) {
        const pos = p2Tokens[i];
        let targetPos = -1;

        if (pos === -1) {
          if (val === 1) targetPos = 0;
        } else if (pos < path.length - 1) {
          targetPos = pos + val;
        }

        if (targetPos !== -1 && targetPos < path.length) {
          if (targetPos >= 16 && pos < 16 && !hasCut) continue;

          // AI Difficulty grading adjustments
          let score = targetPos;
          
          if (difficulty === 'easy') {
            score = Math.random() * 10; // Easy chooses random moves
          } else {
            if (targetPos === path.length - 1) score += 100; // go home

            const cell = path[targetPos];
            const isSafe = isSafeCell(cell.row, cell.col);
            if (!isSafe) {
              const oppCut = p1Tokens.some(oppPos => {
                if (oppPos === -1) return false;
                const oppCell = oppPath[oppPos];
                return oppCell.row === cell.row && oppCell.col === cell.col;
              });
              if (oppCut) score += 80; // prioritize cuts
            }

            if (difficulty === 'hard') {
              if (isSafe) score += 15; // Hard AI prioritizes safe zones
            }
          }

          if (bestMove === null || score > bestMove.score) {
            bestMove = { tokenIdx: i, rollVal: val, score };
          }
        }
      }
    }

    if (bestMove) {
      setSelectedTokenIdx(bestMove.tokenIdx);
      await new Promise(resolve => setTimeout(resolve, 400));
      const rollVal = bestMove.rollVal;
      const tIdx = bestMove.tokenIdx;
      const currPos = p2Tokens[tIdx];
      let targetPos = currPos === -1 ? 0 : currPos + rollVal;
      
      let newTokens = [...p2Tokens];
      newTokens[tIdx] = targetPos;
      setP2Tokens(newTokens);
      playMove();

      const indexInPool = rollPool.indexOf(rollVal);
      const updatedPool = [...rollPool];
      updatedPool.splice(indexInPool, 1);
      setRollPool(updatedPool);
      setSelectedTokenIdx(null);

      const targetCell = path[targetPos];
      const oppIsSafe = isSafeCell(targetCell.row, targetCell.col);
      if (!oppIsSafe) {
        let cutIndex = -1;
        for (let i = 0; i < 4; i++) {
          const oppPos = p1Tokens[i];
          if (oppPos !== -1) {
            const oppCell = oppPath[oppPos];
            if (oppCell.row === targetCell.row && oppCell.col === targetCell.col) {
              cutIndex = i;
              break;
            }
          }
        }
        if (cutIndex !== -1) {
          let newOppTokens = [...p1Tokens];
          newOppTokens[cutIndex] = -1;
          setP1Tokens(newOppTokens);
          setP2HasCut(true);
          setMessage(`BAM! AI cut Player 1's Token at Row ${targetCell.row + 1}, Col ${targetCell.col + 1}!`);
          playDefeat();
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      if (newTokens.every(pos => pos === path.length - 1)) {
        setGameOver(true);
        const username = user?.username || 'Guest';
        setMessage('Game Over! AI won Dayakattai.');
        playDefeat();
        recordGameResult('dayakattai', [username, 'AI'], 'AI', { [username]: p1Tokens.filter(t => t === 23).length });
        return;
      }

      if (updatedPool.length === 0) {
        setIsP1Turn(true);
        setMessage('Player 1 Roll phase.');
      } else {
        const hasMoves = checkValidMoves(updatedPool);
        if (!hasMoves) {
          setMessage('AI has no remaining legal moves. Turn passed.');
          setRollPool([]);
          setIsP1Turn(true);
        }
      }
    } else {
      setRollPool([]);
      setIsP1Turn(true);
      setMessage('AI has no valid moves. Player 1 Roll phase.');
    }
  };

  const renderCellTokens = (row: number, col: number) => {
    const p1OnCell = p1Tokens
      .map((pos, idx) => ({ pos, idx }))
      .filter(t => t.pos !== -1 && P1_PATH[t.pos].row === row && P1_PATH[t.pos].col === col);
    const p2OnCell = p2Tokens
      .map((pos, idx) => ({ pos, idx }))
      .filter(t => t.pos !== -1 && P2_PATH[t.pos].row === row && P2_PATH[t.pos].col === col);

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}>
        {p1OnCell.map(t => (
          <div 
            key={`p1-t-${t.idx}`}
            onClick={(e) => { e.stopPropagation(); handleTokenClick(1, t.idx); }}
            style={tokenStyle(1, selectedTokenIdx === t.idx && isP1Turn)}
          >
            {t.idx + 1}
          </div>
        ))}
        {p2OnCell.map(t => (
          <div 
            key={`p2-t-${t.idx}`}
            onClick={(e) => { e.stopPropagation(); handleTokenClick(2, t.idx); }}
            style={tokenStyle(2, selectedTokenIdx === t.idx && !isP1Turn)}
          >
            {t.idx + 1}
          </div>
        ))}
      </div>
    );
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
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>தாயக்கட்டை / Dayakattai</h2>
          <p style={{ color: 'var(--text-muted)' }}>The traditional Tamil race board game played with long brass dice.</p>
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
        
        {/* 5x5 Board Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 75px)', gridTemplateRows: 'repeat(5, 75px)', gap: '4px', backgroundColor: 'var(--border-color)', padding: '6px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
          {boardCells.map((rowArr, rIdx) => 
            rowArr.map((cellNum, cIdx) => {
              const safe = isSafeCell(rIdx, cIdx);
              const isCenter = rIdx === 2 && cIdx === 2;
              
              return (
                <div 
                  key={cellNum}
                  style={cellStyle(rIdx, cIdx, safe, isCenter)}
                >
                  {safe && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(178,138,42,0.15)', fontSize: '2.5rem', fontWeight: 300, pointerEvents: 'none' }}>
                      ✕
                    </div>
                  )}
                  {safe && !isCenter && (
                    <span style={{ position: 'absolute', top: '2px', right: '3px', fontSize: '0.6rem', color: '#b28a2a', fontWeight: 'bold' }}>
                      SAFE
                    </span>
                  )}
                  {isCenter && (
                    <span style={{ position: 'absolute', top: '2px', right: '3px', fontSize: '0.6rem', color: 'var(--success)', fontWeight: 'bold' }}>
                      HOME
                    </span>
                  )}

                  {renderCellTokens(rIdx, cIdx)}
                </div>
              );
            })
          )}
        </div>

        {/* Rolling Controls & Pools */}
        <div style={controlPanelStyle}>
          <div style={{ textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Turn</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isP1Turn ? 'var(--primary)' : 'var(--secondary)' }}>
              {isP1Turn ? 'Player 1 (Red)' : gameMode === 'ai' ? 'AI (Gold)' : 'Player 2 (Gold)'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.8rem', width: '100%', justifyContent: 'space-around' }}>
            <span style={{ color: p1HasCut ? 'var(--success)' : 'var(--text-muted)' }}>
              P1 Cut: {p1HasCut ? '✔ Unlocked' : '❌ Locked'}
            </span>
            <span style={{ color: p2HasCut ? 'var(--success)' : 'var(--text-muted)' }}>
              P2 Cut: {p2HasCut ? '✔ Unlocked' : '❌ Locked'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
            <div style={stickStyle(isRolling)}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{diceVisual[0] === 0 ? 'X' : diceVisual[0]}</span>
            </div>
            <div style={stickStyle(isRolling)}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{diceVisual[1] === 0 ? 'X' : diceVisual[1]}</span>
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling || gameOver || rollPool.length > 0 && !rollPool.includes(1) && !rollPool.includes(5) && !rollPool.includes(12) || (!isP1Turn && gameMode === 'ai')}
            style={rollButtonStyle(isRolling || gameOver || (!isP1Turn && gameMode === 'ai'))}
          >
            {isRolling ? 'Rolling...' : 'Roll sticks'}
          </button>

          {rollPool.length > 0 && (
            <div style={{ marginTop: '0.8rem', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center' }}>Choose Roll to Move:</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {rollPool.map((val, idx) => (
                  <button
                    key={`${val}-${idx}`}
                    onClick={() => handleMoveToken(val)}
                    disabled={selectedTokenIdx === null || (!isP1Turn && gameMode === 'ai')}
                    style={poolValueButtonStyle}
                  >
                    Move {val}
                  </button>
                ))}
              </div>
              {selectedTokenIdx === null && (
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textAlign: 'center', marginTop: '0.4rem' }}>
                  (Select one of your tokens on the board or side pools first)
                </div>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.8rem', paddingTop: '0.8rem', width: '100%' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Starting Pool</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem' }}>🔴 Player 1:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {p1Tokens.map((pos, idx) => (
                  pos === -1 ? (
                    <div 
                      key={idx} 
                      onClick={() => handleTokenClick(1, idx)}
                      style={tokenStyle(1, selectedTokenIdx === idx && isP1Turn)}
                    >
                      {idx + 1}
                    </div>
                  ) : null
                ))}
                {p1Tokens.every(pos => pos !== -1) && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>None</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem' }}>🟡 P2 / AI:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {p2Tokens.map((pos, idx) => (
                  pos === -1 ? (
                    <div 
                      key={idx} 
                      onClick={() => handleTokenClick(2, idx)}
                      style={tokenStyle(2, selectedTokenIdx === idx && !isP1Turn)}
                    >
                      {idx + 1}
                    </div>
                  ) : null
                ))}
                {p2Tokens.every(pos => pos !== -1) && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>None</span>}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Game Status Banner */}
      <div style={statusBannerStyle(gameOver)}>
        {message}
      </div>

      {/* Rules Box */}
      <div className="glass" style={rulesBoxStyle}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={16} /> Dayakattai 5x5 Thayam Rules
        </h4>
        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <li>You have <strong>4 tokens</strong> starting off-board.</li>
          <li>To enter a token onto the board (at starting safe zone), you must roll a <strong>1 (Dhaayam)</strong>.</li>
          <li>Rolls of <strong>1, 5, or 12</strong> grant you an <strong>extra roll</strong>! Rolls accumulate in a pool.</li>
          <li>Opponents cannot cut you on <strong>Safe Zones (SAFE)</strong>. Safe zones are marked with <strong>✕</strong>.</li>
          <li><strong>CRITICAL</strong>: You <strong>must cut</strong> at least one opponent token before you can enter the inner loop to reach the center <strong>HOME</strong>!</li>
        </ul>
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

const cellStyle = (row: number, col: number, safe: boolean, center: boolean) => {
  let bg = 'var(--bg-card)';
  let border = '1px solid var(--border-color)';
  
  if (center) bg = 'rgba(34, 197, 94, 0.15)'; 
  else if (safe) bg = 'rgba(229, 192, 96, 0.15)'; 

  return {
    width: '75px',
    height: '75px',
    backgroundColor: bg,
    border,
    borderRadius: '6px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
};

const tokenStyle = (player: 1 | 2, selected: boolean) => ({
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  backgroundColor: player === 1 ? 'var(--primary)' : 'var(--secondary)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: selected ? '2.5px solid #fff' : '1px solid rgba(0,0,0,0.3)',
  boxShadow: selected ? '0 0 10px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.2)',
  transform: selected ? 'scale(1.2)' : 'scale(1)',
  transition: 'all 0.15s ease',
});

const stickStyle = (rolling: boolean) => ({
  width: '80px',
  height: '24px',
  backgroundColor: '#f5ebe0',
  backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #dcd0c0 100%)',
  color: '#4a2e0f',
  border: '2px solid #b28a2a',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  animation: rolling ? 'bounceUp 0.15s ease infinite alternate' : 'none',
});

const controlPanelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  backgroundColor: 'var(--bg-card)',
  padding: '1.2rem',
  borderRadius: '12px',
  boxShadow: 'var(--shadow-md)',
  width: '260px',
  border: '1px solid var(--border-color)',
};

const rollButtonStyle = (disabled: boolean) => ({
  width: '100%',
  padding: '0.6rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? 'var(--border-color)' : 'var(--primary)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: disabled ? 'default' : 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.85rem',
});

const poolValueButtonStyle = {
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  border: '1px solid var(--primary)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--primary)',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.8rem',
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
