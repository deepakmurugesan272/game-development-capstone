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
  const [showPulavarIntro, setShowPulavarIntro] = useState<boolean>(true);

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
    setMessage(language === 'en' ? "Game restarted. Player 1's roll phase." : 'விளையாட்டு மீளமைக்கப்பட்டது. முதல் விளையாட்டாளர் உருட்டவும்.');
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
      setMessage(language === 'en' ? `Rolled a ${rollVal === 1 ? 'Dhaayam (1)' : rollVal}! You earned an EXTRA roll.` : `உருட்டப்பட்டது: ${rollVal === 1 ? 'தாயம் (1)' : rollVal}! மீண்டும் உருட்ட உங்களுக்கு வாய்ப்பு உள்ளது.`);
    } else {
      setMessage(language === 'en' ? `Rolled a ${rollVal}. Now select a token and a move from your pool.` : `விழுந்த எண்: ${rollVal}. காயைத் தேர்ந்தெடுத்து நகர்த்தவும்.`);
      
      const hasMoves = checkValidMoves(newPool);
      if (!hasMoves) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMessage(language === 'en' ? 'No legal moves available. Turn passed.' : 'நகர்த்த வழிகள் ஏதுமில்லை. அடுத்த விளையாட்டாளர் முறை.');
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
      setMessage(language === 'en' ? 'You must roll the sticks first!' : 'பகடையை முதலில் உருட்ட வேண்டும்!');
      return;
    }

    setSelectedTokenIdx(tokenIdx);
    setMessage(language === 'en' ? `Selected Token ${tokenIdx + 1}. Select which roll to use.` : `காய் ${tokenIdx + 1} தேர்வுசெய்யப்பட்டது. நகர்த்த வேண்டிய எண்ணைக் கிளிக் செய்யவும்.`);
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
        setMessage(language === 'en' ? 'Tokens in starting pool can only enter on a roll of 1 (Dhaayam).' : 'தாயம் (1) விழுந்தால் மட்டுமே காய்களைத் தொடங்க முடியும்.');
        return;
      }
    } else {
      targetPos = currPos + rollVal;
    }

    if (targetPos >= path.length) {
      setMessage(language === 'en' ? 'Move exceeds the Home limit.' : 'நகர்வு எல்லையைத் தாண்டுகிறது.');
      return;
    }

    const hasCut = isP1Turn ? p1HasCut : p2HasCut;
    if (targetPos >= 16 && currPos < 16 && !hasCut) {
      setMessage(language === 'en' ? 'Cannot enter inner loop or Home without cutting at least one opponent token first!' : 'குறைந்தது ஒரு எதிரிக் காயையாவது வெட்டினால் மட்டுமே நடுமனைக்குள் நுழைய முடியும்!');
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
          setMessage(language === 'en' ? `BAM! Player 1 cut Player 2's Token! Enter-Inner path unlocked.` : 'பலே! இரண்டாம் விளையாட்டாளரின் காய் வெட்டப்பட்டது! உள்மனைப் பாதை திறந்தது.');
        }

        if (opponent === 2) {
          setP2HasCut(true); 
          setMessage(language === 'en' ? `BAM! ${gameMode === 'ai' ? 'AI' : 'Player 2'} cut Player 1's Token!` : `பலே! ${gameMode === 'ai' ? 'கணினி' : 'இரண்டாம் விளையாட்டாளர்'} உங்களது காயை வெட்டியது!`);
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
        setMessage(language === 'en' ? 'CONGRATULATIONS! You successfully navigated all tokens home and won Dayakattai!' : 'வாழ்த்துகள்! அனைத்துக் காய்களையும் பழமாக்கி ஆட்டத்தை வென்றீர்கள்!');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('dayakattai', [username, gameMode === 'ai' ? 'AI' : 'Guest'], username, { [username]: 4 });
      } else {
        setMessage(language === 'en' ? `Game Over! ${gameMode === 'ai' ? 'AI' : 'Player 2'} successfully reached home first!` : `ஆட்டம் முடிந்தது! ${gameMode === 'ai' ? 'கணினி' : 'இரண்டாம் விளையாட்டாளர்'} முதலில் நடுமனையை அடைந்து வென்றது!`);
        playDefeat();
        recordGameResult('dayakattai', [username, gameMode === 'ai' ? 'AI' : 'Guest'], gameMode === 'ai' ? 'AI' : 'Guest', { [username]: newTokens.filter(t => t === 23).length });
      }
      return;
    }

    if (updatedPool.length === 0) {
      setIsP1Turn(!isP1Turn);
      setMessage(isP1Turn 
        ? (language === 'en' ? `${gameMode === 'ai' ? 'AI' : 'Player 2'} Roll phase.` : `${gameMode === 'ai' ? 'கணினி' : 'இரண்டாம் விளையாட்டாளர்'} உருட்டவும்.`)
        : (language === 'en' ? 'Player 1 Roll phase.' : 'முதல் விளையாட்டாளர் உருட்டவும்.')
      );
    } else {
      const hasMoves = checkValidMoves(updatedPool);
      if (!hasMoves) {
        setMessage(language === 'en' ? 'No remaining legal moves with pool. Turn passed.' : 'நகர்த்த வழிகள் ஏதுமில்லை. முறை மாறுகிறது.');
        setRollPool([]);
        setIsP1Turn(!isP1Turn);
      } else {
        setMessage(language === 'en' ? 'Select another token to use the remaining rolls.' : 'மீதமுள்ள எண்களுக்கு மற்றொரு காயைத் தேர்வுசெய்து நகர்த்தவும்.');
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

          let score = targetPos;
          
          if (difficulty === 'easy') {
            score = Math.random() * 10;
          } else {
            if (targetPos === path.length - 1) score += 100;

            const cell = path[targetPos];
            const isSafe = isSafeCell(cell.row, cell.col);
            if (!isSafe) {
              const oppCut = p1Tokens.some(oppPos => {
                if (oppPos === -1) return false;
                const oppCell = oppPath[oppPos];
                return oppCell.row === cell.row && oppCell.col === cell.col;
              });
              if (oppCut) score += 80;
            }

            if (difficulty === 'hard') {
              if (isSafe) score += 15;
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
          setMessage(language === 'en' ? `BAM! AI cut Player 1's Token!` : `பலே! கணினி உங்களது காயை வெட்டியது!`);
          playDefeat();
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      if (newTokens.every(pos => pos === path.length - 1)) {
        setGameOver(true);
        const username = user?.username || 'Guest';
        setMessage(language === 'en' ? 'Game Over! AI won Dayakattai.' : 'ஆட்டம் முடிந்தது! கணினி வென்றது.');
        playDefeat();
        recordGameResult('dayakattai', [username, 'AI'], 'AI', { [username]: p1Tokens.filter(t => t === 23).length });
        return;
      }

      if (updatedPool.length === 0) {
        setIsP1Turn(true);
        setMessage(language === 'en' ? 'Player 1 Roll phase.' : 'முதல் விளையாட்டாளர் முறை உருட்டவும்.');
      } else {
        const hasMoves = checkValidMoves(updatedPool);
        if (!hasMoves) {
          setMessage(language === 'en' ? 'AI has no remaining legal moves. Turn passed.' : 'நகர்த்த வழிகள் ஏதுமில்லை. கணினி முறை மாறியது.');
          setRollPool([]);
          setIsP1Turn(true);
        }
      }
    } else {
      setRollPool([]);
      setIsP1Turn(true);
      setMessage(language === 'en' ? 'AI has no valid moves. Player 1 Roll phase.' : 'கணினிக்கு நகர்வுகள் ஏதுமில்லை. முதல் விளையாட்டாளர் முறை.');
    }
  };

  const renderStickMarkings = (val: number) => {
    if (val === 0) {
      return (
        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.75)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>
          ✕
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
        {Array.from({ length: val }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: '#ffffff', 
              boxShadow: 'inset 0 1.5px 1px rgba(0,0,0,0.8), 0 0.5px 1px rgba(255,255,255,0.3)' 
            }} 
          />
        ))}
      </div>
    );
  };

  const renderCellTokens = (row: number, col: number) => {
    const p1OnCell = p1Tokens
      .map((pos, idx) => ({ pos, idx }))
      .filter(t => t.pos !== -1 && P1_PATH[t.pos].row === row && P1_PATH[t.pos].col === col);
    const p2OnCell = p2Tokens
      .map((pos, idx) => ({ pos, idx }))
      .filter(t => t.pos !== -1 && P2_PATH[t.pos].row === row && P2_PATH[t.pos].col === col);

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center' }}>
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

      {/* Tamil Pulavar Welcome & Rules Intro Modal */}
      {showPulavarIntro && (
        <div style={tutorialOverlayStyle}>
          <div className="glass animate-fade" style={pulavarModalStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/tamil_pulavar.jpg" 
                  alt="Tamil Pulavar" 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    border: '4px solid var(--secondary)',
                    boxShadow: '0 4px 15px rgba(229,192,96,0.5)',
                    objectFit: 'cover'
                  }} 
                />
                <span style={{ position: 'absolute', bottom: '0', right: '5px', fontSize: '1.6rem' }}>🎲</span>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                  {language === 'en' ? 'Tamil Pulavar Guide' : 'தமிழ் புலவர் வழிகாட்டி'}
                </h3>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {language === 'en' ? '"The race of life relies on destiny\'s roll, but victory belongs to strategic pathways."' : '"விதியின் உருட்டல் பாதையை அமைக்கும், ஆனால் மதியின் நகர்வே வெற்றியைத் தரும்."'}
                </p>
              </div>

              <div style={{ width: '100%', maxHeight: '240px', overflowY: 'auto', textAlign: 'left', padding: '0 0.5rem', margin: '0.5rem 0' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '📜 Cultural Origin & Significance' : '📜 கலாச்சார பின்னணி'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {language === 'en' 
                      ? 'Dayakattai is a historical Tamil race game. It represents the journey of life through obstacles, safe havens, and direct conflict. Players roll long brass dice to race their pawns around the outer path, with the goal of entering the inner sanctuary to reach the center Palace (Home).'
                      : 'தாயக்கட்டை என்பது பாரம்பரிய தமிழ் ஓட்டப் பந்தய விளையாட்டு ஆகும். தடைகள், புகலிடங்கள் மற்றும் எதிர்ப்புகளின் வழியே கடக்கும் வாழ்க்கை நெறியை இது குறிக்கிறது. நீளப்பகடையை உருட்டி, காய்களை வெட்டி வீழ்த்தி, உள்வட்டத்தின் வழியே நடுமனையை (பழம்) அடையப் போராடுவதே இதன் நோக்கம்.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '🎮 Game Rules' : '🎮 விளையாட்டு விதிகள்'}
                  </h4>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0 }}>
                    {language === 'en' ? (
                      <>
                        <li>Each player has 4 tokens starting off-board.</li>
                        <li>To enter a token onto the board starting safe zone, you must roll a **1 (Dhaayam)**.</li>
                        <li>Rolls of **1, 5, or 12** grant you an **extra roll**! Rolls accumulate in a pool.</li>
                        <li>Safe zones (✕) are safe; landing elsewhere on an opponent cuts their token.</li>
                        <li>**CRITICAL**: You **must cut** at least one opponent token to enter the center **HOME**!</li>
                      </>
                    ) : (
                      <>
                        <li>விளையாடுபவருக்கு தலா 4 காய்கள் உண்டு. அவை முதலில் களத்திற்கு வெளியே இருக்கும்.</li>
                        <li>களத்தில் காயைத் தொடங்க **1 (தாயம்)** விழ வேண்டும்.</li>
                        <li>பகடையில் **1, 5, அல்லது 12** விழுந்தால் மீண்டும் பகடையை உருட்ட வாய்ப்பு கிடைக்கும்!</li>
                        <li>பாதுகாப்பு கட்டங்களில் ✕ காய்களை வெட்ட முடியாது; மற்ற கட்டங்களில் எதிரிக் காயை வெட்டலாம்.</li>
                        <li>**முக்கிய விதி**: எதிரியின் காயை வெட்டினால் மட்டுமே உள்வட்டப் பாதை திறந்து நடுமனையை அடைய முடியும்!</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setShowPulavarIntro(false)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: 'var(--brass-grain)', 
                  color: '#3b2005', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(178,138,42,0.3)',
                  transition: 'transform 0.1s ease'
                }}
              >
                {language === 'en' ? 'Enter Heritage Game' : 'ஆட்டத்தைத் தொடங்கு'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>தாயக்கட்டை / Dayakattai</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {language === 'en' 
              ? 'The traditional Tamil race board game played with long brass dice.' 
              : 'தாயக்கட்டை: நீளப் பகடைகள் கொண்டு ஆடப்படும் பழங்கால தமிழ் ஓட்டப் பந்தய விளையாட்டு.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <option value="easy">{language === 'en' ? 'Easy AI' : 'எளிதான கணினி'}</option>
              <option value="medium">{language === 'en' ? 'Medium AI' : 'நடுத்தர கணினி'}</option>
              <option value="hard">{language === 'en' ? 'Smart AI' : 'சாமர்த்திய கணினி'}</option>
            </select>
          )}

          <button 
            className={`btn-toggle ${gameMode === 'ai' ? 'active' : ''}`}
            onClick={() => { setGameMode('ai'); initGame(); }}
            style={toggleBtnStyle(gameMode === 'ai')}
          >
            <Cpu size={16} /> {t('vs_ai')}
          </button>
          <button 
            className={`btn-toggle ${gameMode === 'local' ? 'active' : ''}`}
            onClick={() => { setGameMode('local'); initGame(); }}
            style={toggleBtnStyle(gameMode === 'local')}
          >
            <User size={16} /> {t('pass_play')}
          </button>
          <button onClick={initGame} style={resetBtnStyle}>
            <RotateCcw size={16} /> {t('reset')}
          </button>
        </div>
      </div>

      <div style={gridAndControlStyle}>
        
        {/* 5x5 Board Grid with realistic wood frame styling */}
        <div 
          className="wood-board" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 75px)', 
            gridTemplateRows: 'repeat(5, 75px)', 
            gap: '6px', 
            backgroundColor: '#5a2e0f', 
            padding: '12px', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-lg), 0 10px 25px rgba(139, 74, 29, 0.25)',
            border: '6px solid #4a2307'
          }}
        >
          {boardCells.map((rowArr, rIdx) => 
            rowArr.map((cellNum, cIdx) => {
              const safe = isSafeCell(rIdx, cIdx);
              const isCenter = rIdx === 2 && cIdx === 2;
              
              return (
                <div 
                  key={cellNum}
                  style={cellStyle(rIdx, cIdx, safe, isCenter)}
                >
                  {/* Decorative Traditional Safe Zone Cross SVG lines */}
                  {safe && (
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }} viewBox="0 0 100 100">
                      <line x1="15" y1="15" x2="85" y2="85" stroke={isCenter ? "var(--success)" : "#78350f"} strokeWidth="5.5" strokeLinecap="round" />
                      <line x1="85" y1="15" x2="15" y2="85" stroke={isCenter ? "var(--success)" : "#78350f"} strokeWidth="5.5" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="9" fill={isCenter ? "var(--success)" : "#78350f"} />
                    </svg>
                  )}
                  {safe && !isCenter && (
                    <span style={{ position: 'absolute', top: '3px', right: '4px', fontSize: '0.55rem', color: '#8b5a2b', fontWeight: 'bold' }}>
                      SAFE
                    </span>
                  )}
                  {isCenter && (
                    <span style={{ position: 'absolute', top: '3px', right: '4px', fontSize: '0.55rem', color: 'var(--success)', fontWeight: 'bold' }}>
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              {language === 'en' ? 'ACTIVE TURN' : 'தற்போதைய முறை'}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isP1Turn ? 'var(--primary)' : 'var(--secondary)', marginTop: '0.2rem' }}>
              {isP1Turn ? (language === 'en' ? 'Player 1 (Red)' : 'விளையாட்டாளர் 1') : gameMode === 'ai' ? (language === 'en' ? 'AI (Gold)' : 'கணினி') : (language === 'en' ? 'Player 2 (Gold)' : 'விளையாட்டாளர் 2')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.8rem', width: '100%', justifyContent: 'space-around', fontWeight: 700 }}>
            <span style={{ color: p1HasCut ? 'var(--success)' : 'var(--text-muted)' }}>
              P1 {p1HasCut ? '✔ Cut' : '❌ Lock'}
            </span>
            <span style={{ color: p2HasCut ? 'var(--success)' : 'var(--text-muted)' }}>
              P2 {p2HasCut ? '✔ Cut' : '❌ Lock'}
            </span>
          </div>

          {/* Brass long sticks */}
          <div style={{ display: 'flex', gap: '1.2rem', margin: '0.8rem 0' }}>
            <div style={stickStyle(isRolling)}>
              {renderStickMarkings(diceVisual[0])}
            </div>
            <div style={stickStyle(isRolling)}>
              {renderStickMarkings(diceVisual[1])}
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling || gameOver || rollPool.length > 0 && !rollPool.includes(1) && !rollPool.includes(5) && !rollPool.includes(12) || (!isP1Turn && gameMode === 'ai')}
            style={rollButtonStyle(isRolling || gameOver || (!isP1Turn && gameMode === 'ai'))}
          >
            {isRolling 
              ? (language === 'en' ? 'Rolling...' : 'உருளுகிறது...') 
              : (language === 'en' ? 'Roll Sticks' : 'உருட்டவும்')}
          </button>

          {rollPool.length > 0 && (
            <div style={{ marginTop: '0.8rem', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: 'center', fontWeight: 600 }}>Choose Roll:</div>
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
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textAlign: 'center', marginTop: '0.4rem', fontWeight: 600 }}>
                  {language === 'en' ? '(Select a token on board or starting pool first)' : '(நகர்த்த வேண்டிய காயை முதலில் தேர்ந்தெடுங்கள்)'}
                </div>
              )}
            </div>
          )}

          {/* Staging Pools */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.8rem', paddingTop: '0.8rem', width: '100%' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              {language === 'en' ? 'STARTING POOLS' : 'தொடக்கக் குவியல்'}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>🔴 P1:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>🟡 P2/AI:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
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
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', fontWeight: 700 }}>
          <Info size={16} /> {language === 'en' ? 'Dayakattai 5x5 Thayam Rules' : 'தாயக்கட்டை ஆட்ட விதிமுறைகள்'}
        </h4>
        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {language === 'en' ? (
            <>
              <li>Each player has <strong>4 tokens</strong> starting off-board.</li>
              <li>To enter a token onto the board (at starting safe zone), you must roll a <strong>1 (Dhaayam)</strong>.</li>
              <li>Rolls of <strong>1, 5, or 12</strong> grant you an <strong>extra roll</strong>! Rolls accumulate in a pool.</li>
              <li>Opponents cannot cut you on <strong>Safe Zones (SAFE)</strong>. Safe zones are marked with <strong>✕</strong>.</li>
              <li><strong>CRITICAL</strong>: You <strong>must cut</strong> at least one opponent token before you can enter the inner loop to reach the center <strong>HOME</strong>!</li>
            </>
          ) : (
            <>
              <li>விளையாடுபவருக்கு தலா <strong>4 காய்கள்</strong> உண்டு. அவை முதலில் களத்திற்கு வெளியே இருக்கும்.</li>
              <li>களத்தில் காயைத் தொடங்க <strong>1 (தாயம்)</strong> விழ வேண்டும். தாயம் விழுந்த காய் தொடக்க வாயிலில் வைக்கப்படும்.</li>
              <li>பகடையில் <strong>1, 5, அல்லது 12</strong> விழுந்தால் மீண்டும் பகடையை உருட்ட வாய்ப்பு கிடைக்கும்!</li>
              <li><strong>பாதுகாப்பு கட்டம் (SAFE)</strong> ✕ குறியிடப்பட்டுள்ளது. அங்குள்ள காய்களை வெட்ட முடியாது.</li>
              <li><strong>முக்கிய விதி</strong>: எதிரியின் காயை வெட்டினால் மட்டுமே காய்கள் உள்வட்டத்திற்குள் நுழைந்து <strong>நடுமனையை (பழம்)</strong> அடைய முடியும்!</li>
            </>
          )}
        </ul>
      </div>

    </div>
  );
};

// Styles and helpers
const cellStyle = (row: number, col: number, safe: boolean, center: boolean) => {
  let bg = '#fbf8f3';
  let border = '2.5px solid #5c4033';
  
  if (center) bg = 'rgba(34, 197, 94, 0.18)'; 
  else if (safe) bg = 'rgba(212, 163, 115, 0.2)'; 

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

const tokenStyle = (player: 1 | 2, selected: boolean) => {
  const bg = player === 1 
    ? 'radial-gradient(circle at 35% 35%, #ef4444 0%, #991b1b 65%, #450a0a 100%)' 
    : 'radial-gradient(circle at 35% 35%, #f59e0b 0%, #b45309 65%, #78350f 100%)';
  const border = selected ? '2.5px solid #ffffff' : '1.5px solid rgba(0,0,0,0.45)';
  return {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: bg,
    border,
    boxShadow: selected ? '0 0 12px rgba(251,191,36,0.8), 0 3px 5px rgba(0,0,0,0.4)' : '0 2.5px 4px rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: selected ? '1.5px solid var(--secondary)' : 'none',
    transform: selected ? 'scale(1.15) translateY(-2px)' : 'scale(1)',
  };
};

const stickStyle = (rolling: boolean) => ({
  width: '26px',
  height: '100px',
  background: 'linear-gradient(135deg, #f59e0b 0%, #b28a2a 50%, #78350f 100%)',
  border: '2.5px solid #d97706',
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 12px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.2)',
  color: '#fff',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  transition: 'all 0.1s ease',
  ...(rolling && { animation: 'rollDice 0.4s infinite linear' }),
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
  padding: '0.8rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: disabled ? 'var(--border-color)' : 'var(--primary)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: disabled ? 'default' : 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
});

const poolValueButtonStyle = {
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  border: '2px solid var(--primary)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--primary)',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

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
  backdropFilter: 'blur(5px)'
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

const pulavarModalStyle = {
  padding: '2.5rem 2rem',
  borderRadius: '20px',
  width: '480px',
  maxWidth: '92%',
  boxShadow: 'var(--shadow-lg), 0 10px 30px rgba(0,0,0,0.4)',
  border: '2.5px solid var(--secondary)',
  outline: 'none',
  backgroundColor: 'var(--bg-card)',
};


