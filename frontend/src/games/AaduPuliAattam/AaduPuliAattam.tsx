import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { RotateCcw, Cpu, User, Info, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoardNode {
  id: number;
  x: number;
  y: number;
}

const NODES: BoardNode[] = [
  { id: 0, x: 200, y: 30 }, // Apex
  
  // Row 1
  { id: 1, x: 150, y: 110 },
  { id: 2, x: 200, y: 110 },
  { id: 3, x: 250, y: 110 },
  
  // Row 2
  { id: 4, x: 100, y: 190 },
  { id: 5, x: 150, y: 190 },
  { id: 6, x: 200, y: 190 },
  { id: 7, x: 250, y: 190 },
  { id: 8, x: 300, y: 190 },
  
  // Row 3
  { id: 9, x: 50, y: 270 },
  { id: 10, x: 125, y: 270 },
  { id: 11, x: 200, y: 270 },
  { id: 12, x: 275, y: 270 },
  { id: 13, x: 350, y: 270 },
  
  // Row 4 (Base)
  { id: 14, x: 0, y: 350 },
  { id: 15, x: 100, y: 350 },
  { id: 16, x: 200, y: 350 },
  { id: 17, x: 300, y: 350 },
  { id: 18, x: 400, y: 350 },
  
  // Wings
  { id: 19, x: 75, y: 150 },  // Left side extra
  { id: 20, x: 25, y: 230 },  // Left side lower extra
  { id: 21, x: 325, y: 150 }, // Right side extra
  { id: 22, x: 375, y: 230 }, // Right side lower extra
];

// Connectivity Graph
const ADJACENCY: Record<number, number[]> = {
  0: [1, 2, 3],
  1: [0, 2, 4, 5, 19],
  2: [0, 1, 3, 6],
  3: [0, 2, 7, 8, 21],
  4: [1, 5, 9, 19],
  5: [1, 4, 6, 10],
  6: [2, 5, 7, 11],
  7: [3, 6, 8, 12],
  8: [3, 7, 13, 21],
  9: [4, 10, 14, 20],
  10: [5, 9, 11, 15],
  11: [6, 10, 12, 16],
  12: [7, 11, 13, 17],
  13: [8, 12, 18, 22],
  14: [9, 15, 20],
  15: [10, 14, 16],
  16: [11, 15, 17],
  17: [12, 16, 18],
  18: [13, 17, 22],
  19: [1, 4, 20],
  20: [9, 14, 19],
  21: [3, 8, 22],
  22: [13, 18, 21],
};

// Tiger Jumps: [from, over, to]
const JUMPS: [number, number, number][] = [
  [0, 2, 6], [6, 2, 0],
  [2, 6, 11], [11, 6, 2],
  [6, 11, 16], [16, 11, 6],
  [0, 1, 4], [4, 1, 0],
  [1, 4, 9], [9, 4, 1],
  [4, 9, 14], [14, 9, 4],
  [0, 3, 8], [8, 3, 0],
  [3, 8, 13], [13, 8, 3],
  [8, 13, 18], [18, 13, 8],
  [0, 1, 5], [5, 1, 0],
  [1, 5, 10], [10, 5, 1],
  [5, 10, 15], [15, 10, 5],
  [0, 3, 7], [7, 3, 0],
  [3, 7, 12], [12, 7, 3],
  [7, 12, 17], [17, 12, 7],
  [1, 2, 3], [3, 2, 1],
  [4, 5, 6], [6, 5, 4], [5, 6, 7], [7, 6, 5], [6, 7, 8], [8, 7, 6],
  [9, 10, 11], [11, 10, 9], [10, 11, 12], [12, 11, 10], [11, 12, 13], [13, 12, 11],
  [14, 15, 16], [16, 15, 14], [15, 16, 17], [17, 16, 15], [16, 17, 18], [18, 17, 16],
  [19, 4, 9], [9, 4, 19],
  [1, 4, 20], [20, 4, 1],
  [21, 8, 13], [13, 8, 21],
  [3, 8, 22], [22, 8, 3]
];

export const AaduPuliAattam: React.FC = () => {
  const { user, recordGameResult } = useAuth();
  const { playMove, playVictory, playDefeat } = useSound();
  const { t, language } = useLanguage();

  const [tigers, setTigers] = useState<number[]>([0, 5, 7]); 
  const [goats, setGoats] = useState<number[]>([]);
  const [goatsPlaced, setGoatsPlaced] = useState<number>(0); 
  const [goatsKilled, setGoatsKilled] = useState<number>(0);
  
  const [isGoatTurn, setIsGoatTurn] = useState<boolean>(true); 
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null); 
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  
  const [gameMode, setGameMode] = useState<'local' | 'ai_tiger' | 'ai_goat'>('ai_tiger'); 
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Goat Placement Phase: Click any empty node to place a Goat.');

  // Advanced features: AI difficulty & Tutorials
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [showPulavarIntro, setShowPulavarIntro] = useState<boolean>(true);

  const tutorialTexts = [
    { title: 'Tigers vs Goats', body: 'Aadu Puli Aattam is an asymmetrical game of strength vs unity. One player controls 3 Tigers, and the other controls 15 Goats.' },
    { title: 'Placement Phase', body: 'Goats start off-board. The Goat player places one goat on any empty node. The Tigers slide or jump immediately after each goat is placed.' },
    { title: 'Tiger Hunts (Jump)', body: 'Tigers capture Goats by jumping over a single Goat along a line onto an empty intersection behind it. Jumps are mandatory if you want to win as Tigers!' },
    { title: 'Win Conditions', body: 'Tigers win by killing 5 Goats (preventing Goats from blocking them). Goats win by surrounding and trapping all 3 Tigers so they have no legal moves.' }
  ];

  const initGame = () => {
    setTigers([0, 5, 7]);
    setGoats([]);
    setGoatsPlaced(0);
    setGoatsKilled(0);
    setIsGoatTurn(true);
    setSelectedPiece(null);
    setLegalMoves([]);
    setGameOver(false);
    setMessage(language === 'en' ? 'Goat Placement Phase: Click empty node to place Goat.' : 'ஆடு வைக்கும் நிலை: காலியாக உள்ள புள்ளியில் ஆட்டை வைக்கவும்.');
  };

  const checkGameOver = (currentTigers: number[], currentGoats: number[], killedCount: number) => {
    if (killedCount >= 5) {
      setGameOver(true);
      setMessage(language === 'en' ? 'Game Over! Tigers Win (Killed 5 Goats).' : 'ஆட்டம் முடிந்தது! புலிகள் வென்றன (5 ஆடுகள் வெட்டப்பட்டன).');
      const username = user?.username || 'Guest';
      
      if (gameMode === 'ai_goat') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('aadupuli', [username, 'AI'], username);
      } else {
        playDefeat();
        recordGameResult('aadupuli', [username, 'AI'], 'AI');
      }
      return true;
    }

    let hasMove = false;
    for (const tiger of currentTigers) {
      const adjacentMoves = ADJACENCY[tiger].filter(n => !currentTigers.includes(n) && !currentGoats.includes(n));
      const jumpMoves = JUMPS.filter(j => j[0] === tiger && currentGoats.includes(j[1]) && !currentTigers.includes(j[2]) && !currentGoats.includes(j[2]));
      
      if (adjacentMoves.length > 0 || jumpMoves.length > 0) {
        hasMove = true;
        break;
      }
    }

    if (!hasMove) {
      setGameOver(true);
      setMessage(language === 'en' ? 'Game Over! Goats Win (Tigers Trapped).' : 'ஆட்டம் முடிந்தது! ஆடுகள் வென்றன (புலிகள் முடக்கப்பட்டன).');
      const username = user?.username || 'Guest';
      
      if (gameMode === 'ai_tiger') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playVictory();
        recordGameResult('aadupuli', [username, 'AI'], username);
      } else {
        playDefeat();
        recordGameResult('aadupuli', [username, 'AI'], 'AI');
      }
      return true;
    }

    return false;
  };

  const handleNodeClick = (nodeId: number) => {
    if (gameOver) return;

    if (isGoatTurn && gameMode === 'ai_goat') return;
    if (!isGoatTurn && gameMode === 'ai_tiger') return;

    if (isGoatTurn) {
      if (goatsPlaced < 15) {
        if (tigers.includes(nodeId) || goats.includes(nodeId)) return;
        
        const newGoats = [...goats, nodeId];
        setGoats(newGoats);
        setGoatsPlaced(prev => prev + 1);
        playMove();
        
        const isOver = checkGameOver(tigers, newGoats, goatsKilled);
        if (!isOver) {
          setIsGoatTurn(false);
          setMessage(language === 'en' ? 'Tiger Turn: Move an adjacent Tiger or jump/kill a Goat.' : 'புலி முறை: புலியை நகர்த்தவும் அல்லது ஆட்டை வெட்டவும்.');
        }
      } else {
        if (selectedPiece === null) {
          if (!goats.includes(nodeId)) return;
          setSelectedPiece(nodeId);
          const moves = ADJACENCY[nodeId].filter(n => !tigers.includes(n) && !goats.includes(n));
          setLegalMoves(moves);
        } else {
          if (legalMoves.includes(nodeId)) {
            const newGoats = goats.map(g => g === selectedPiece ? nodeId : g);
            setGoats(newGoats);
            setSelectedPiece(null);
            setLegalMoves([]);
            playMove();

            const isOver = checkGameOver(tigers, newGoats, goatsKilled);
            if (!isOver) {
              setIsGoatTurn(false);
              setMessage(language === 'en' ? 'Tiger Turn: Move a Tiger.' : 'புலி முறை: புலியை நகர்த்தவும்.');
            }
          } else {
            if (goats.includes(nodeId)) {
              setSelectedPiece(nodeId);
              const moves = ADJACENCY[nodeId].filter(n => !tigers.includes(n) && !goats.includes(n));
              setLegalMoves(moves);
            } else {
              setSelectedPiece(null);
              setLegalMoves([]);
            }
          }
        }
      }
    } else {
      if (selectedPiece === null) {
        if (!tigers.includes(nodeId)) return;
        setSelectedPiece(nodeId);
        
        const adjacent = ADJACENCY[nodeId].filter(n => !tigers.includes(n) && !goats.includes(n));
        const jumps = JUMPS.filter(j => j[0] === nodeId && goats.includes(j[1]) && !tigers.includes(j[2]) && !goats.includes(j[2])).map(j => j[2]);
        
        setLegalMoves([...adjacent, ...jumps]);
      } else {
        if (legalMoves.includes(nodeId)) {
          const jumpInfo = JUMPS.find(j => j[0] === selectedPiece && j[2] === nodeId && goats.includes(j[1]));
          
          let newGoats = [...goats];
          let newKilled = goatsKilled;

          if (jumpInfo) {
            const killedGoat = jumpInfo[1];
            newGoats = goats.filter(g => g !== killedGoat);
            newKilled = goatsKilled + 1;
            setGoats(newGoats);
            setGoatsKilled(newKilled);
            playDefeat(); 
          } else {
            playMove();
          }

          const newTigers = tigers.map(t => t === selectedPiece ? nodeId : t);
          setTigers(newTigers);
          setSelectedPiece(null);
          setLegalMoves([]);

          const isOver = checkGameOver(newTigers, newGoats, newKilled);
          if (!isOver) {
            setIsGoatTurn(true);
            setMessage(goatsPlaced < 15 
              ? (language === 'en' ? `Goat Placement Phase: Place Goat ${goatsPlaced + 1} of 15.` : `ஆடு வைக்கும் முறை: 15-ல் ${goatsPlaced + 1} ஆட்டை வைக்கவும்.`)
              : (language === 'en' ? 'Goat Move Phase: Move a Goat.' : 'ஆடு நகர்த்தும் முறை: ஆட்டை நகர்த்தவும்.')
            );
          }
        } else {
          if (tigers.includes(nodeId)) {
            setSelectedPiece(nodeId);
            const adjacent = ADJACENCY[nodeId].filter(n => !tigers.includes(n) && !goats.includes(n));
            const jumps = JUMPS.filter(j => j[0] === nodeId && goats.includes(j[1]) && !tigers.includes(j[2]) && !goats.includes(j[2])).map(j => j[2]);
            setLegalMoves([...adjacent, ...jumps]);
          } else {
            setSelectedPiece(null);
            setLegalMoves([]);
          }
        }
      }
    }
  };

  // AI Triggers
  useEffect(() => {
    if (gameOver) return;

    if (!isGoatTurn && gameMode === 'ai_tiger') {
      const timer = setTimeout(() => {
        makeTigerAiMove();
      }, 700);
      return () => clearTimeout(timer);
    }

    if (isGoatTurn && gameMode === 'ai_goat') {
      const timer = setTimeout(() => {
        makeGoatAiMove();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isGoatTurn, gameMode, gameOver]);

  // Tiger AI logic
  const makeTigerAiMove = () => {
    const availableJumps: { tiger: number; over: number; to: number }[] = [];
    for (const tiger of tigers) {
      const jumps = JUMPS.filter(j => j[0] === tiger && goats.includes(j[1]) && !tigers.includes(j[2]) && !goats.includes(j[2]));
      jumps.forEach(j => availableJumps.push({ tiger: j[0], over: j[1], to: j[2] }));
    }

    if (availableJumps.length > 0 && difficulty !== 'easy') {
      const bestJump = availableJumps[Math.floor(Math.random() * availableJumps.length)];
      applyTigerMove(bestJump.tiger, bestJump.to, bestJump.over);
      return;
    }

    const availableMoves: { tiger: number; to: number }[] = [];
    for (const tiger of tigers) {
      const adjacent = ADJACENCY[tiger].filter(n => !tigers.includes(n) && !goats.includes(n));
      adjacent.forEach(to => availableMoves.push({ tiger, to }));
    }

    if (availableMoves.length > 0) {
      let selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

      if (difficulty === 'hard') {
        let maxMobility = -1;
        for (const move of availableMoves) {
          const nextTigers = tigers.map(t => t === move.tiger ? move.to : t);
          const mobility = nextTigers.reduce((acc, t) => acc + ADJACENCY[t].length, 0);
          if (mobility > maxMobility) {
            maxMobility = mobility;
            selectedMove = move;
          }
        }
      }

      applyTigerMove(selectedMove.tiger, selectedMove.to);
    }
  };

  const applyTigerMove = (tiger: number, target: number, killedGoat?: number) => {
    let newGoats = [...goats];
    let newKilled = goatsKilled;

    if (killedGoat !== undefined) {
      newGoats = goats.filter(g => g !== killedGoat);
      newKilled = goatsKilled + 1;
      setGoats(newGoats);
      setGoatsKilled(newKilled);
      playDefeat();
    } else {
      playMove();
    }

    const newTigers = tigers.map(t => t === tiger ? target : t);
    setTigers(newTigers);

    const isOver = checkGameOver(newTigers, newGoats, newKilled);
    if (!isOver) {
      setIsGoatTurn(true);
      setMessage(goatsPlaced < 15 
        ? (language === 'en' ? `Goat Placement Phase: Place Goat ${goatsPlaced + 1} of 15.` : `ஆடு வைக்கும் முறை: 15-ல் ${goatsPlaced + 1} ஆட்டை வைக்கவும்.`)
        : (language === 'en' ? 'Goat Move Phase: Move a Goat.' : 'ஆடு நகர்த்தும் முறை: ஆட்டை நகர்த்தவும்.')
      );
    }
  };

  // Goat AI logic
  const makeGoatAiMove = () => {
    if (goatsPlaced < 15) {
      const emptyNodes = NODES.map(n => n.id).filter(id => !tigers.includes(id) && !goats.includes(id));
      if (emptyNodes.length === 0) return;

      let bestPlacement = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];

      if (difficulty !== 'easy') {
        let maxScore = -100;
        for (const node of emptyNodes) {
          const adjGoats = ADJACENCY[node].filter(n => goats.includes(n)).length;
          const isVulnerable = JUMPS.some(j => j[1] === node && tigers.includes(j[0]) && !goats.includes(j[2]) && !tigers.includes(j[2]));
          let score = adjGoats;
          if (isVulnerable) score -= 4; // penalty for vulnerability

          if (score > maxScore) {
            maxScore = score;
            bestPlacement = node;
          }
        }
      }

      const newGoats = [...goats, bestPlacement];
      setGoats(newGoats);
      setGoatsPlaced(prev => prev + 1);
      playMove();

      const isOver = checkGameOver(tigers, newGoats, goatsKilled);
      if (!isOver) {
        setIsGoatTurn(false);
        setMessage(language === 'en' ? 'Tiger Turn: Tigers make their move...' : 'புலி முறை: கணினி புலியை நகர்த்துகிறது...');
      }
    } else {
      const availableMoves: { goat: number; to: number }[] = [];
      for (const goat of goats) {
        const adjacent = ADJACENCY[goat].filter(n => !tigers.includes(n) && !goats.includes(n));
        adjacent.forEach(to => availableMoves.push({ goat, to }));
      }

      if (availableMoves.length === 0) return;

      let selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

      if (difficulty !== 'easy') {
        let bestScore = -100;
        for (const move of availableMoves) {
          const nextGoats = goats.map(g => g === move.goat ? move.to : g);
          const tigerMobility = tigers.reduce((acc, t) => {
            return acc + ADJACENCY[t].filter(n => !tigers.includes(n) && !nextGoats.includes(n)).length;
          }, 0);
          
          let score = -tigerMobility; 
          if (score > bestScore) {
            bestScore = score;
            selectedMove = move;
          }
        }
      }

      const newGoats = goats.map(g => g === selectedMove.goat ? selectedMove.to : g);
      setGoats(newGoats);
      playMove();

      const isOver = checkGameOver(tigers, newGoats, goatsKilled);
      if (!isOver) {
        setIsGoatTurn(false);
        setMessage(language === 'en' ? 'Tiger Turn: Tigers make their move...' : 'புலி முறை: கணினி புலியை நகர்த்துகிறது...');
      }
    }
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
                <span style={{ position: 'absolute', bottom: '0', right: '5px', fontSize: '1.6rem' }}>🐯</span>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                  {language === 'en' ? 'Tamil Pulavar Guide' : 'தமிழ் புலவர் வழிகாட்டி'}
                </h3>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {language === 'en' ? '"Strength without unity falls to strategy. Study your hunter, trap with wisdom."' : '"ஒற்றுமை இல்லா வலிமை வீழும். எதிரியை அறிந்து, உத்தியால் முடக்கு."'}
                </p>
              </div>

              <div style={{ width: '100%', maxHeight: '240px', overflowY: 'auto', textAlign: 'left', padding: '0 0.5rem', margin: '0.5rem 0' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '📜 Cultural Origin & Significance' : '📜 கலாச்சார பின்னணி'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {language === 'en' 
                      ? 'Aadu Puli Aattam (Goats and Tigers) is an ancient, asymmetric tactical board game from southern India. It portrays a battle between a small group of apex predators (3 Tigers) and a larger flock of prey (15 Goats). It teaches cooperation, defensive blockades, and hunting tactics.'
                      : 'ஆடு புலி ஆட்டம் என்பது தென்னிந்தியாவின் பாரம்பரிய, சமச்சீரற்ற உத்தி விளையாட்டு ஆகும். இது 3 புலிகளின் வலிமைக்கும் 15 ஆடுகளின் ஒற்றுமைக்கும் இடையே நடக்கும் போரைக் காட்டுகிறது. கூட்டுச் செயல்பாடு, அரண் அமைத்தல், மற்றும் வேட்டைத் தந்திரங்களை இது கற்றுக்கொடுக்கிறது.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                    {language === 'en' ? '🎮 Game Rules' : '🎮 விளையாட்டு விதிகள்'}
                  </h4>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0 }}>
                    {language === 'en' ? (
                      <>
                        <li>3 Tigers start on the board apex and center intersections.</li>
                        <li>**Goat Placement**: Place goats one by one on empty spaces. Tigers move/jump between placements.</li>
                        <li>**Movement**: Once all 15 goats are on board, goats can move to adjacent empty nodes.</li>
                        <li>**Tiger Jumps**: Tigers capture a goat by jumping over it in a straight line onto an empty space behind it.</li>
                        <li>Goats win by trapping all 3 tigers. Tigers win by capturing 5 goats.</li>
                      </>
                    ) : (
                      <>
                        <li>3 புலிகள் முக்கோணக் கட்டத்தின் உச்சி மற்றும் நடுப் புள்ளிகளில் இருக்கும்.</li>
                        <li>**ஆடு வைக்கும் நிலை**: 15 ஆடுகளையும் ஒவ்வொன்றாக காலியான புள்ளிகளில் வைக்க வேண்டும்.</li>
                        <li>**நகர்த்தும் நிலை**: 15 ஆடுகளும் களத்தில் வைக்கப்பட்ட பின்பு, ஆடுகள் தங்களுக்கு அடுத்த காலியான புள்ளிகளுக்கு நகரும்.</li>
                        <li>**புலி வேட்டை**: புலிகள் ஆடுகளைத் தாண்டி வெட்டி வீழ்த்த முயலும்.</li>
                        <li>புலிகளை முடக்கினால் ஆடுகளுக்கு வெற்றி. 5 ஆடுகளை வெட்டினால் புலிகளுக்கு வெற்றி.</li>
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
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>ஆடு புலி ஆட்டம் / Aadu Puli Aattam</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {language === 'en' 
              ? 'Goats and Tigers: A traditional Tamil strategic hunt game of wits and blockades.' 
              : 'ஆடு புலி ஆட்டம்: ஆடுகளின் ஒற்றுமைக்கும் புலிகளின் பலத்திற்கும் இடையே நடக்கும் உத்தி வேட்டை.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setShowTutorial(true); setTutorialStep(0); }}
            style={{ ...resetBtnStyle, color: 'var(--primary)' }}
          >
            <HelpCircle size={16} /> Tutorial
          </button>

          {gameMode !== 'local' && (
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

          <select 
            value={gameMode} 
            onChange={(e) => { setGameMode(e.target.value as any); initGame(); }}
            style={selectStyle}
          >
            <option value="ai_tiger">{language === 'en' ? 'Play as Goats (vs Tiger AI)' : 'ஆடாக விளையாடு (கணினி புலி)'}</option>
            <option value="ai_goat">{language === 'en' ? 'Play as Tigers (vs Goat AI)' : 'புலியாக விளையாடு (கணினி ஆடு)'}</option>
            <option value="local">{language === 'en' ? 'Pass & Play (Local 2P)' : 'நண்பருடன் விளையாடு (உள்ளூர்)'}</option>
          </select>
          <button onClick={initGame} style={resetBtnStyle}>
            <RotateCcw size={16} /> {t('reset')}
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {language === 'en' ? 'Goats Placed' : 'வைக்கப்பட்ட ஆடுகள்'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>{goatsPlaced} / 15</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {language === 'en' ? 'Active Goats' : 'களத்தில் உள்ள ஆடுகள்'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>{goats.length}</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {language === 'en' ? 'Goats Killed' : 'வெட்டப்பட்ட ஆடுகள்'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>{goatsKilled} / 5</div>
        </div>
      </div>

      {/* SVG Triangular Game Board with realistic wooden board frame styling */}
      <div 
        className="wood-board" 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '2rem', 
          borderRadius: '16px', 
          boxShadow: 'var(--shadow-lg), 0 10px 25px rgba(139, 74, 29, 0.25)', 
          marginBottom: '1.5rem', 
          position: 'relative',
          backgroundColor: '#fbf8f3',
          border: '8px solid #5a2e0f',
          backgroundImage: 'linear-gradient(rgba(251, 248, 243, 0.9), rgba(251, 248, 243, 0.9)), var(--wood-grain)'
        }}
      >
        {/* Brass corner brackets decorative accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '16px', height: '16px', borderTop: '3px solid #e5c060', borderLeft: '3px solid #e5c060' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', borderTop: '3px solid #e5c060', borderRight: '3px solid #e5c060' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '16px', height: '16px', borderBottom: '3px solid #e5c060', borderLeft: '3px solid #e5c060' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', borderBottom: '3px solid #e5c060', borderRight: '3px solid #e5c060' }} />

        <svg 
          width="400" 
          height="400" 
          viewBox="0 0 400 400"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="tigerGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="65%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <radialGradient id="goatGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>
          </defs>

          {/* Draw Board Lines in deep rich charcoal wood-engraved color */}
          <line x1="200" y1="30" x2="0" y2="350" stroke="#4a2e1b" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="200" y1="30" x2="400" y2="350" stroke="#4a2e1b" strokeWidth="4.5" strokeLinecap="round" />
          
          <line x1="200" y1="30" x2="100" y2="350" stroke="#5c4033" strokeWidth="3" />
          <line x1="200" y1="30" x2="200" y2="350" stroke="#5c4033" strokeWidth="3" />
          <line x1="200" y1="30" x2="300" y2="350" stroke="#5c4033" strokeWidth="3" />

          <line x1="150" y1="110" x2="250" y2="110" stroke="#5c4033" strokeWidth="3" />
          <line x1="100" y1="190" x2="300" y2="190" stroke="#5c4033" strokeWidth="3" />
          <line x1="50" y1="270" x2="350" y2="270" stroke="#5c4033" strokeWidth="3" />
          <line x1="0" y1="350" x2="400" y2="350" stroke="#4a2e1b" strokeWidth="4.5" strokeLinecap="round" />

          {/* Left Wing lines */}
          <line x1="150" y1="110" x2="75" y2="150" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="75" y1="150" x2="100" y2="190" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="100" y1="190" x2="25" y2="230" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="25" y1="230" x2="50" y2="270" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="50" y1="270" x2="25" y2="230" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="25" y1="230" x2="0" y2="350" stroke="#7c5e4b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="75" y1="150" x2="25" y2="230" stroke="#7c5e4b" strokeWidth="2" />

          {/* Right Wing lines */}
          <line x1="250" y1="110" x2="325" y2="150" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="325" y1="150" x2="300" y2="190" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="300" y1="190" x2="375" y2="230" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="375" y1="230" x2="350" y2="270" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="350" y1="270" x2="375" y2="230" stroke="#7c5e4b" strokeWidth="2" />
          <line x1="375" y1="230" x2="400" y2="350" stroke="#7c5e4b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="325" y1="150" x2="375" y2="230" stroke="#7c5e4b" strokeWidth="2" />

          {/* Draw Board Nodes */}
          {NODES.map(node => {
            const isTiger = tigers.includes(node.id);
            const isGoat = goats.includes(node.id);
            const isSelected = selectedPiece === node.id;
            const isHighlighted = legalMoves.includes(node.id);

            return (
              <g 
                key={node.id} 
                onClick={() => handleNodeClick(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Active legal move selection aura */}
                {isHighlighted && (
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r="15" 
                    fill="var(--success)" 
                    opacity="0.45"
                    style={{ animation: 'bounceUp 1.5s infinite ease-in-out' }}
                  />
                )}

                {/* Base Node Intersection Marker */}
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="6.5" 
                  fill={isHighlighted ? 'var(--success)' : '#d4a373'} 
                  stroke="#4a2e1b"
                  strokeWidth="2"
                />

                {/* Tiger pieces rendered as premium 3D tokens with 🐯 emoji */}
                {isTiger && (
                  <g style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}>
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r="16" 
                      fill="url(#tigerGrad)" 
                      stroke={isSelected ? 'var(--secondary)' : '#78350f'}
                      strokeWidth={isSelected ? 3.5 : 1.5}
                      style={{ transition: 'all 0.2s ease', outline: isSelected ? '2px solid #fff' : 'none' }}
                    />
                    <text 
                      x={node.x} 
                      y={node.y + 4.5} 
                      textAnchor="middle" 
                      fontSize="14"
                      fontWeight="bold"
                    >
                      🐯
                    </text>
                  </g>
                )}

                {/* Goat pieces rendered as premium 3D stone tokens with 🐐 emoji */}
                {isGoat && (
                  <g style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))' }}>
                    <circle 
                      cx={node.x} 
                      cy={node.y} 
                      r="13" 
                      fill="url(#goatGrad)" 
                      stroke={isSelected ? 'var(--primary)' : '#94a3b8'}
                      strokeWidth={isSelected ? 3 : 1.2}
                      style={{ transition: 'all 0.2s ease', outline: isSelected ? '2px solid #fff' : 'none' }}
                    />
                    <text 
                      x={node.x} 
                      y={node.y + 4} 
                      textAnchor="middle" 
                      fontSize="11.5"
                      fontWeight="bold"
                    >
                      🐐
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Game Status Banner */}
      <div style={statusBannerStyle(gameOver)}>
        {message}
      </div>

      {/* Rules Box */}
      <div className="glass" style={rulesBoxStyle}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>
          <Info size={16} /> {language === 'en' ? 'Game Rules & Mechanics' : 'விளையாட்டு விதிமுறைகள்'}
        </h4>
        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {language === 'en' ? (
            <>
              <li>There are <strong>3 Tigers (புலி)</strong> and <strong>15 Goats (ஆடு)</strong>.</li>
              <li>Tigers start placed on the board apex and middle intersections.</li>
              <li><strong>Goat Placement</strong>: Place goats one by one on empty intersections. Tigers move/jump immediately after each placement.</li>
              <li><strong>Movement</strong>: Once all 15 goats are on the board, goats can move to adjacent empty nodes.</li>
              <li><strong>Tiger Hunts</strong>: Tigers capture a goat by jumping over it in a straight line onto an empty space behind it.</li>
              <li><strong>Win Conditions</strong>: Goats win by surrounding and trapping all 3 tigers. Tigers win by capturing 5 goats.</li>
            </>
          ) : (
            <>
              <li>இவ்விளையாட்டில் <strong>3 புலிகளும் (🐯)</strong>, <strong>15 ஆடுகளும் (🐐)</strong> பயன்படுத்தப்படுகின்றன.</li>
              <li>புலிகள் முக்கோணத்தின் உச்சி மற்றும் நடுப் புள்ளிகளில் ஆட்டத் தொடக்கத்தில் இருக்கும்.</li>
              <li><strong>ஆடு வைக்கும் நிலை</strong>: ஆடுகள் ஒவ்வொன்றாக காலியான புள்ளிகளில் வைக்கப்படும். ஒவ்வொரு ஆடு வைக்கப்பட்ட பின்னும் புலி நகரும்.</li>
              <li><strong>நகர்த்தும் நிலை</strong>: 15 ஆடுகளும் வைக்கப்பட்ட பின்பு, ஆடுகள் தங்களுக்கு அடுத்த காலியான புள்ளிகளுக்கு நகர்த்தப்படும்.</li>
              <li><strong>புலி வேட்டை</strong>: புலிகள் ஆடுகளைத் தாண்டி வெட்டி வீழ்த்த முயலும் (ஆட்டிற்கு பின் புள்ளி காலியாக இருக்க வேண்டும்).</li>
              <li><strong>வெற்றி நிபந்தனை</strong>: புலிகள் நகர முடியாமல் ஆடுகள் முடக்கினால் ஆடுகளுக்கு வெற்றி. 5 ஆடுகளை வெட்டினால் புலிகளுக்கு வெற்றி.</li>
            </>
          )}
        </ul>
      </div>

    </div>
  );
};

// CSS Styles
const selectStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

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

const statBoxStyle = {
  backgroundColor: 'var(--bg-card)',
  padding: '1rem 0.8rem',
  borderRadius: '12px',
  textAlign: 'center' as const,
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border-color)',
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
  alignItems: 'center',
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

