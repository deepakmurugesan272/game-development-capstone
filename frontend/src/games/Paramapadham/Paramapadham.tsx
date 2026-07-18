import React, { useState, useEffect, useRef } from 'react';
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
  const [message, setMessage] = useState<string>(
    language === 'en' 
      ? 'Roll the die to begin your spiritual climb!' 
      : 'விளையாட்டைத் தொடங்க பகடையை உருட்டவும்!'
  );

  // Advanced features: AI difficulty & Tamil Pulavar Welcome Modal
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showPulavarIntro, setShowPulavarIntro] = useState<boolean>(true);

  // Session ID to cancel async transitions on game resets/restarts
  const sessionIdRef = useRef<number>(0);

  // Initialize/Restart Game
  const initGame = () => {
    setP1Pos(1);
    setP2Pos(1);
    setIsP1Turn(true);
    setDieValue(1);
    setIsRolling(false);
    setGameOver(false);
    setMessage(
      language === 'en' 
        ? "Game restarted. Player 1's turn." 
        : 'விளையாட்டுத் தொடங்கியது. முதல் விளையாட்டாளர் உருட்டவும்.'
    );
    sessionIdRef.current += 1;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionIdRef.current += 1;
    };
  }, []);

  const handleRollDie = async () => {
    if (isRolling || gameOver) return;
    if (!isP1Turn && gameMode === 'ai') return;
    await executeTurn();
  };

  const executeTurn = async () => {
    const activeSession = sessionIdRef.current;
    setIsRolling(true);
    playDiceRoll();

    let roll = 1;
    for (let i = 0; i < 6; i++) {
      if (sessionIdRef.current !== activeSession) return;
      roll = Math.floor(Math.random() * 6) + 1;
      setDieValue(roll);
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    if (sessionIdRef.current !== activeSession) return;
    setIsRolling(false);
    
    const currPos = isP1Turn ? p1Pos : p2Pos;
    let nextPos = currPos + roll;

    // AI Smart Moves Tweaks: Medium/Hard AI tries to choose a better virtual roll (tweak)
    if (!isP1Turn && gameMode === 'ai') {
      if (difficulty === 'hard') {
        const idealRolls = [1, 2, 3, 4, 5, 6].filter(r => {
          const target = currPos + r;
          return target <= 100 && LADDERS[target] && !SNAKES[target];
        });
        if (idealRolls.length > 0 && Math.random() < 0.6) {
          roll = idealRolls[0];
          nextPos = currPos + roll;
          setDieValue(roll);
        }
      }
    }

    if (nextPos > 100) {
      setMessage(
        language === 'en'
          ? `Rolled ${roll}. Needed ${100 - currPos} to reach Vaikundam. Turn skipped.`
          : `உருட்டப்பட்ட எண்: ${roll}. வைகுண்டத்தை அடைய ${100 - currPos} தேவை. இந்த முறை கடந்தது.`
      );
      setIsP1Turn(!isP1Turn);
      return;
    }

    let tempPos = currPos;
    while (tempPos < nextPos) {
      if (sessionIdRef.current !== activeSession) return;
      tempPos++;
      if (isP1Turn) setP1Pos(tempPos);
      else setP2Pos(tempPos);
      playMove();
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    if (sessionIdRef.current !== activeSession) return;

    if (LADDERS[nextPos]) {
      const top = LADDERS[nextPos];
      const label = SPECIAL_LABELS[nextPos]?.title || (language === 'en' ? 'Virtue' : 'அறநெறி');
      setMessage(
        language === 'en'
          ? `Climbed Ladder via ${SPECIAL_LABELS[nextPos]?.desc || 'Virtue'} from ${nextPos} to ${top}!`
          : `${label} வழியே ${nextPos}-லிருந்து ${top}-க்கு ஏறியது!`
      );
      await new Promise(resolve => setTimeout(resolve, 400));
      if (sessionIdRef.current !== activeSession) return;
      nextPos = top;
      if (isP1Turn) setP1Pos(nextPos);
      else setP2Pos(nextPos);
      playVictory();
    } 
    else if (SNAKES[nextPos]) {
      const tail = SNAKES[nextPos];
      const label = SPECIAL_LABELS[nextPos]?.title || (language === 'en' ? 'Vice' : 'தீயகுணம்');
      setMessage(
        language === 'en'
          ? `Bitten by Snake via ${SPECIAL_LABELS[nextPos]?.desc || 'Vice'} sliding from ${nextPos} down to ${tail}!`
          : `${label} பாம்பு தீண்டி ${nextPos}-லிருந்து ${tail}-க்கு இறங்கியது!`
      );
      await new Promise(resolve => setTimeout(resolve, 400));
      if (sessionIdRef.current !== activeSession) return;
      nextPos = tail;
      if (isP1Turn) setP1Pos(nextPos);
      else setP2Pos(nextPos);
      playDefeat();
    } else {
      setMessage(
        language === 'en'
          ? `Moved ${roll} spaces to cell ${nextPos}.`
          : `${roll} கட்டங்கள் நகர்ந்து ${nextPos}-ஐ அடைந்தது.`
      );
    }

    if (nextPos === 100) {
      setGameOver(true);
      const username = user?.username || 'Guest';

      if (isP1Turn) {
        setMessage(
          language === 'en'
            ? 'Congratulations! Player 1 reached Vaikundam (Square 100) and won!'
            : 'வாழ்த்துகள்! முதல் விளையாட்டாளர் வைகுண்டத்தை (100) அடைந்து வென்றார்!'
        );
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('paramapadham', [username, gameMode === 'ai' ? 'AI' : 'Guest'], username, { [username]: 100 });
      } else {
        setMessage(
          language === 'en'
            ? `${gameMode === 'ai' ? 'AI Opponent' : 'Player 2'} reached Vaikundam and won!`
            : `${gameMode === 'ai' ? 'கணினி' : 'இரண்டாம் விளையாட்டாளர்'} வைகுண்டத்தை அடைந்து வென்றார்!`
        );
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
                    width: '130px', 
                    height: '130px', 
                    borderRadius: '50%', 
                    border: '4px solid var(--secondary)',
                    boxShadow: '0 4px 15px rgba(229,192,96,0.5)',
                    objectFit: 'cover'
                  }} 
                />
                <span style={{ position: 'absolute', bottom: '0', right: '10px', fontSize: '1.8rem' }}>🕉️</span>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                  {language === 'en' ? 'Tamil Pulavar Guide' : 'தமிழ் புலவர் வழிகாட்டி'}
                </h3>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {language === 'en' ? '"Virtue elevates the soul; Vice leads to rebirth."' : '"அறநெறி நம்மை உயர்த்தும்; மறநெறி பிறவிச்சுழலுக்குத் தள்ளும்."'}
                </p>
              </div>

              <div style={{ width: '100%', maxHeight: '250px', overflowY: 'auto', textAlign: 'left', padding: '0 0.5rem', margin: '0.5rem 0' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '📜 Cultural Origin & Significance' : '📜 கலாச்சார பின்னணி'}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {language === 'en' 
                      ? 'Paramapadham (Path to Salvation) is a traditional board game representing human life. The board is a journey of the soul to Vaikundam (Square 100). Ladders are Virtues (Dharma, Satya, Daya) that climb us high, while Snakes are Vices (Pride, Greed, Anger) that slip us back.'
                      : 'பரமபதம் (வீடுபேறுக்கான வழி) என்பது மனித ஆன்மாவின் ஆன்மீகப் பயணத்தைக் குறிக்கும் ஒரு விளையாட்டு ஆகும். 100-வது கட்டம் வைகுண்டத்தைக் (வீடுபேறு) குறிக்கும். ஏணிகள் நற்பண்புகளையும் (அறம், வாய்மை, அருள்), பாம்புகள் தீய குணங்களையும் (சினக்குணம், பேராசை, அகந்தை) குறிக்கின்றன.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '🎮 Game Rules' : '🎮 விளையாட்டு விதிகள்'}
                  </h4>
                  <ul style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0 }}>
                    {language === 'en' ? (
                      <>
                        <li>Roll the dice to move your token forward.</li>
                        <li>Landing on a **ladder bottom** climbs you to its top.</li>
                        <li>Landing on a **snake head** slides you down to its tail.</li>
                        <li>To win, you must land **exactly** on cell 100. Over-rolling skips your turn!</li>
                      </>
                    ) : (
                      <>
                        <li>பகடையை உருட்டி உங்கள் காய்களை முன்னோக்கி நகர்த்தவும்.</li>
                        <li>**ஏணியின் அடியில்** நின்றால், அதன் உச்சிக்கு ஏறிச் செல்லலாம்.</li>
                        <li>**பாம்பின் வாயில்** நின்றால், அதன் வால் பகுதிக்கு இறங்கி விடுவீர்கள்.</li>
                        <li>வெற்றி பெற **சரியாக 100-வது** கட்டத்தை அடைய வேண்டும். கூடுதல் எண் விழுந்தால் அந்த முறை கடந்து போகும்.</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setShowPulavarIntro(false)}
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '0.8rem 2.5rem', 
                  borderRadius: '30px', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(229,74,45,0.4)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {language === 'en' ? "Let's Play!" : "விளையாடலாம்!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>பரமபதம் / Paramapadham</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {language === 'en'
              ? 'Snakes & Ladders: The journey of the soul conquering vices (snakes) through virtues (ladders).'
              : 'பரமபதம்: தீய குணங்களை வென்று வீடுபேறடையும் ஆன்மாவின் ஆன்மீகப் பயணம்.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowPulavarIntro(true)}
            style={{ 
              ...resetBtnStyle, 
              color: 'var(--primary)', 
              borderColor: 'var(--primary)',
              backgroundColor: 'rgba(229, 74, 45, 0.05)'
            }}
          >
            📜 {language === 'en' ? 'Pulavar Guide' : 'புலவர் வழிகாட்டி'}
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
        
        {/* Board Canvas with double layered frame */}
        <div 
          className="wood-board" 
          style={{ 
            position: 'relative', 
            width: '400px', 
            height: '400px', 
            boxShadow: 'var(--shadow-lg), 0 0 25px rgba(139, 74, 29, 0.25)', 
            overflow: 'hidden', 
            boxSizing: 'content-box',
            borderRadius: '12px'
          }}
        >
          <svg width="400" height="400" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
            <defs>
              <linearGradient id="ladderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="30%" stopColor="#d97706" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="50%" stopColor="#047857" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
              <radialGradient id="snakeHeadGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="85%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </radialGradient>
            </defs>

            {/* Draw Ladders */}
            {Object.entries(LADDERS).map(([bottom, top]) => {
              const bCoords = getCellCoords(Number(bottom));
              const tCoords = getCellCoords(top);
              // Calculate side rails
              const dx = tCoords.x - bCoords.x;
              const dy = tCoords.y - bCoords.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const px = -dy / len;
              const py = dx / len;
              
              const offset = 6;
              const lx1 = bCoords.x - px * offset;
              const ly1 = bCoords.y - py * offset;
              const lx2 = tCoords.x - px * offset;
              const ly2 = tCoords.y - py * offset;

              const rx1 = bCoords.x + px * offset;
              const ry1 = bCoords.y + py * offset;
              const rx2 = tCoords.x + px * offset;
              const ry2 = tCoords.y + py * offset;

              return (
                <g key={`lad-${bottom}`} style={{ filter: 'drop-shadow(1px 3px 5px rgba(0,0,0,0.4))' }}>
                  {/* Left Rail */}
                  <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="url(#ladderGrad)" strokeWidth="4" strokeLinecap="round" />
                  {/* Right Rail */}
                  <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="url(#ladderGrad)" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Rungs */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const ratio = (i + 1) / 7;
                    const rungX1 = lx1 + (lx2 - lx1) * ratio;
                    const rungY1 = ly1 + (ly2 - ly1) * ratio;
                    const rungX2 = rx1 + (rx2 - rx1) * ratio;
                    const rungY2 = ry1 + (ry2 - ry1) * ratio;
                    return <line key={i} x1={rungX1} y1={rungY1} x2={rungX2} y2={rungY2} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />;
                  })}
                </g>
              );
            })}

            {/* Draw Snakes */}
            {Object.entries(SNAKES).map(([head, tail]) => {
              const hCoords = getCellCoords(Number(head));
              const tCoords = getCellCoords(tail);
              const dx = tCoords.x - hCoords.x;
              const dy = tCoords.y - hCoords.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const px = -dy / len;
              const py = dx / len;
              const waveAmt = 16;
              const cp1x = hCoords.x + dx * 0.33 + px * waveAmt;
              const cp1y = hCoords.y + dy * 0.33 + py * waveAmt;
              const cp2x = hCoords.x + dx * 0.66 - px * waveAmt;
              const cp2y = hCoords.y + dy * 0.66 - py * waveAmt;
              
              const pathD = `M ${hCoords.x} ${hCoords.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tCoords.x} ${tCoords.y}`;
              
              const angle = Math.atan2(dy, dx);
              const tongueX = hCoords.x - Math.cos(angle) * 7;
              const tongueY = hCoords.y - Math.sin(angle) * 7;

              return (
                <g key={`snake-${head}`} style={{ filter: 'drop-shadow(1px 3px 5px rgba(0,0,0,0.4))' }}>
                  {/* Forked Tongue */}
                  <path d={`M ${hCoords.x} ${hCoords.y} L ${tongueX} ${tongueY}`} stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d={`M ${tongueX} ${tongueY} L ${tongueX - Math.cos(angle + 0.3)*4} ${tongueY - Math.sin(angle + 0.3)*4}`} stroke="#dc2626" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d={`M ${tongueX} ${tongueY} L ${tongueX - Math.cos(angle - 0.3)*4} ${tongueY - Math.sin(angle - 0.3)*4}`} stroke="#dc2626" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                  {/* Body */}
                  <path d={pathD} fill="none" stroke="url(#snakeGrad)" strokeWidth="7" strokeLinecap="round" />
                  {/* Pattern / Stripes */}
                  <path d={pathD} fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.75" strokeLinecap="round" />
                  {/* Head */}
                  <circle cx={hCoords.x} cy={hCoords.y} r="6" fill="url(#snakeHeadGrad)" />
                  {/* Glowing Eyes */}
                  <circle cx={hCoords.x - Math.sin(angle)*2.5 - Math.cos(angle)*1.5} cy={hCoords.y + Math.cos(angle)*2.5 - Math.sin(angle)*1.5} r="1.2" fill="#ef4444" />
                  <circle cx={hCoords.x + Math.sin(angle)*2.5 - Math.cos(angle)*1.5} cy={hCoords.y - Math.cos(angle)*2.5 - Math.sin(angle)*1.5} r="1.2" fill="#ef4444" />
                </g>
              );
            })}

            {/* P1 Token (Red) */}
            {p1Pos > 0 && (
              <circle 
                cx={getCellCoords(p1Pos).x - 6} 
                cy={getCellCoords(p1Pos).y} 
                r="8" 
                fill="var(--primary)" 
                stroke="#fff" 
                strokeWidth="2"
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))' }}
              />
            )}

            {/* P2 Token (Gold) */}
            {p2Pos > 0 && (
              <circle 
                cx={getCellCoords(p2Pos).x + 6} 
                cy={getCellCoords(p2Pos).y} 
                r="8" 
                fill="var(--secondary)" 
                stroke="#fff" 
                strokeWidth="2"
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))' }}
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
                  className="paramapadham-cell"
                  style={cellStyle(row, col, isVirtue, isVice)}
                >
                  <span style={{ fontSize: '0.65rem', opacity: 0.65, position: 'absolute', top: '2px', left: '3px', fontWeight: 700 }}>{num}</span>
                  {SPECIAL_LABELS[num] && (
                    <div style={labelStyle(isVirtue)}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800 }}>{SPECIAL_LABELS[num].title}</div>
                      <div style={{ fontSize: '0.42rem', opacity: 0.8, letterSpacing: '0.2px' }}>{SPECIAL_LABELS[num].desc}</div>
                    </div>
                  )}
                  {/* salvation/vaikundam design accent */}
                  {num === 100 && (
                    <div style={{ position: 'absolute', bottom: '2px', right: '3px', fontSize: '0.75rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
                      👑
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>
              {language === 'en' ? 'CURRENT TURN' : 'தற்போதைய முறை'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isP1Turn ? 'var(--primary)' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
              <User size={18} /> {isP1Turn ? (language === 'en' ? 'Player 1 (Red)' : 'விளையாட்டாளர் 1') : gameMode === 'ai' ? (language === 'en' ? 'AI Opponent' : 'கணினி') : (language === 'en' ? 'Player 2 (Gold)' : 'விளையாட்டாளர் 2')}
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
            {isRolling 
              ? (language === 'en' ? 'Rolling...' : 'உருளுகிறது...') 
              : (language === 'en' ? 'Roll Dice' : 'பகடை உருட்டு')}
          </button>

          {/* Quick Standings */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.2rem', width: '100%' }}>
            <div style={playerRowStyle}>
              <span style={{ fontWeight: 600 }}>🔴 {language === 'en' ? 'Player 1' : 'விளையாட்டாளர் 1'}:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{language === 'en' ? `Square ${p1Pos}` : `கட்டம் ${p1Pos}`}</span>
            </div>
            <div style={playerRowStyle}>
              <span style={{ fontWeight: 600 }}>🟡 {gameMode === 'ai' ? (language === 'en' ? 'AI Opponent' : 'கணினி') : (language === 'en' ? 'Player 2' : 'விளையாட்டாளர் 2')}:</span>
              <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{language === 'en' ? `Square ${p2Pos}` : `கட்டம் ${p2Pos}`}</span>
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
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
          {language === 'en' ? 'Cultural Significance of Paramapadham' : 'பரமபதத்தின் கலாச்சார பின்னணி'}
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {language === 'en' ? (
            <>
              Originally designed as a moral tool in ancient Tamil heritage, <strong>Paramapadham</strong> teaches that human life is a series of moral choices. The board maps the journey of the soul towards ultimate liberation, <strong>Vaikundam</strong> (Square 100). The ladders represent virtues like <strong>Dharma</strong> (righteousness) and <strong>Satya</strong> (truth) that lift us higher. The snakes represent vices like <strong>Krodha</strong> (anger) and <strong>Ahamkara</strong> (ego/pride) that drag us down into cycles of rebirth.
            </>
          ) : (
            <>
              பாரம்பரிய தமிழ் சமூகத்தில், <strong>பரமபதம்</strong> ஒரு விளையாட்டு சாதனமாக மட்டுமல்லாமல் அறநெறிகளைப் புகட்டும் ஒரு தத்துவக் கருவியாகப் பயன்படுத்தப்பட்டது. இந்த 100 கட்டப் பயணம் மனிதனின் ஆன்மீக உயர்வைக் குறிக்கிறது. நற்பண்புகளான <strong>அறநெறி</strong> (தர்மம்), <strong>வாய்மை</strong> (சத்தியம்), <strong>அருள்</strong> (கருணை) போன்றவை நம்மை ஏணிகளாய் மேலே ஏற்றிச் செல்லும். மாறாக, தீய குணங்களான <strong>சினம்</strong> (கோபம்), <strong>பொறாமை</strong>, <strong>அகந்தை</strong> (தலைக்கனம்) போன்றவை பாம்பின் வடிவில் நம்மை மீண்டும் பிறவிச் சுழலுக்குள் தள்ளிவிடும்.
            </>
          )}
        </p>
      </div>

    </div>
  );
};

// Styles and helpers
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
  gap: '2rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
  marginBottom: '1.5rem',
};

const cellStyle = (row: number, col: number, isVirtue: boolean, isVice: boolean) => {
  const isLightCell = (row + col) % 2 === 0;
  let bg = isLightCell ? 'var(--bg-app)' : 'var(--bg-card)';
  let border = '1px solid var(--border-color)';
  
  if (isVirtue) bg = 'rgba(167, 139, 250, 0.16)'; 
  if (isVice) bg = 'rgba(239, 68, 68, 0.12)'; 

  const isVaikundam = (row === 9 && col === 0); // Square 100
  if (isVaikundam) {
    bg = 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.3) 100%)';
    border = '2px solid #b28a2a';
  }

  return {
    width: '40px',
    height: '40px',
    backgroundColor: bg,
    border,
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gridColumnStart: col + 1,
    gridRowStart: 10 - row,
    cursor: 'default',
  };
};

const labelStyle = (isVirtue: boolean) => ({
  color: isVirtue ? '#6d28d9' : '#dc2626',
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
  ...(rolling && { animation: 'rollDice 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }),
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

// Tutorial & Pulavar overlay styles
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

const pulavarModalStyle = {
  padding: '2.5rem 2rem',
  borderRadius: '20px',
  width: '480px',
  maxWidth: '92%',
  boxShadow: 'var(--shadow-lg), 0 10px 30px rgba(0,0,0,0.4)',
  border: '2.5px solid var(--secondary)',
  outline: 'none',
};
