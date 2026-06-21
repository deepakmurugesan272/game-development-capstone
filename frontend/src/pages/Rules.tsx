import React, { useState } from 'react';
import { Book, Shield, Library, Info, Compass } from 'lucide-react';

export const Rules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pallanguzhi');

  const historyData: Record<string, { title: string; tamil: string; origin: string; rules: string[] }> = {
    pallanguzhi: {
      title: 'Pallanguzhi',
      tamil: 'பல்லாங்குழி',
      origin: 'Pallanguzhi is a traditional Tamil mancala game played in Southern India. Mentioned in Tamil literature and epics, the game was historically used to teach mental arithmetic, counting skills, and cooperation. It features a board made of wood or brass containing 14 pits/cups.',
      rules: [
        'The game is played by two players on a board of 2 rows and 7 columns, starting with 5 seeds in each cup.',
        'Sowing: Scoop all seeds from any cup on your side and distribute them one-by-one counter-clockwise.',
        'Cascades: If your last seed lands in a cup containing seeds, scoop them all and continue sowing.',
        'Captures: If your last seed lands in a cup and the next cup is empty, your turn ends and you capture all seeds in the cup AFTER the empty cup.',
        'End: The game ends when a player has no seeds remaining on their side to play. The player with the most captured seeds wins.'
      ]
    },
    aadupuli: {
      title: 'Aadu Puli Aattam',
      tamil: 'ஆடு புலி ஆட்டம்',
      origin: 'Aadu Puli Aattam (Goats and Tigers) is a strategic hunt board game that originated in Tamil Nadu. The game depicts the struggle between tigers (representing apex predators/strength) and goats (representing unity/collective strategy). It is historically drawn on stone floors of ancient South Indian temples.',
      rules: [
        'Tigers (3 pieces) and Goats (15 pieces) face off on a triangular board with 23 intersections.',
        'Placement Phase: The goat player places goats one by one on empty spaces. Tigers move or jump after each placement.',
        'Movement Phase: Once all 15 goats are on the board, goats can slide to adjacent empty intersections.',
        'Jumps/Kills: Tigers can jump over a single goat in a straight line to an empty space behind to kill (capture) it.',
        'Win Conditions: Tigers win by killing 5 goats. Goats win by surrounding and blocking all 3 tigers.'
      ]
    },
    paramapadham: {
      title: 'Paramapadham',
      tamil: 'பரமபதம்',
      origin: 'Paramapadham is the ancient version of Snakes and Ladders originating in Tamil temples as a moral tool. The board represents the soul\'s journey (100 cells) to reach Vaikundam (salvation) at cell 100. Ladders represent virtues that accelerate growth, while snakes represent moral vices that cause rebirth.',
      rules: [
        'Roll the die and move your token zig-zag upwards from 1 to 100.',
        'Ladders: Land on a virtue (Dharma, Satya, Compassion) to climb instantly to the top of the ladder.',
        'Snakes: Land on a vice (Pride, Greed, Anger) to slide down to the snake\'s tail.',
        'Exact Landings: You must roll the exact number required to land on square 100 to win.',
        'First player to reach square 100 enters Vaikundam and wins the game.'
      ]
    },
    dayakattai: {
      title: 'Dayakattai',
      tamil: 'தாயக்கட்டை',
      origin: 'Dayakattai is a traditional Tamil race game related to Pachisi. It utilizes two long four-sided brass cuboids as dice (Dayakkatai) and is highly strategic. It forms a core part of family gatherings, particularly during festivals.',
      rules: [
        'Each player has 4 tokens starting off-board. The game is played on a 5x5 board.',
        'Entry: You must roll a Thayam (1) to enter a token onto your starting safe zone.',
        'Dice Rolls: Values include 1 (Thayam), 2, 3, 4, 5, 6, and 12. Rolls of 1, 5, and 12 grant an extra roll.',
        'Cutting: Land on an opponent\'s token (on non-safe spots) to cut it and send it back to the start pool.',
        'Home entry: You are required to cut at least one opponent token before you are allowed to enter the center HOME (2,2) and win!'
      ]
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }} className="animate-fade">
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Library /> விளையாட்டின் வரலாறு / Rules & Culture
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Explore the historical origins and rule guides of classic Tamil heritage board games.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {Object.keys(historyData).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: activeTab === key ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === key ? '#fff' : 'var(--text-main)',
              transition: 'all 0.2s ease'
            }}
          >
            {historyData[key].title}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass" style={{ borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            {historyData[activeTab].title}
          </h3>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
            {historyData[activeTab].tamil}
          </span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
            <Compass size={18} /> Cultural History & Origin
          </h4>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {historyData[activeTab].origin}
          </p>
        </div>

        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', marginBottom: '0.8rem' }}>
            <Info size={18} /> Detailed Rulebook
          </h4>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {historyData[activeTab].rules.map((rule, idx) => (
              <li key={idx} style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                {rule}
              </li>
            ))}
          </ol>
        </div>
      </div>

    </div>
  );
};
