import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Users, Plus, Zap, MessageSquare, Send, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

const MOCK_CHATS = [
  { sender: 'Chezhiyan', text: 'Who is ready for a Dayakattai match? 🎲' },
  { sender: 'Madhavi', text: 'Just won in Aadu Puli! Goats strategy is awesome.' },
  { sender: 'Karikalan', text: 'Nice seed capture in Pallanguzhi!' },
  { sender: 'Senthamil', text: 'Paramapadham is purely about Vaikundam climb!' },
];

export const Lobby: React.FC<{ onLaunchGame: (game: string) => void }> = ({ onLaunchGame }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [activeRooms, setActiveRooms] = useState([
    { id: 'room-1', name: 'Pallanguzhi Masters', game: 'pallanguzhi', players: 1, host: 'Madhavi' },
    { id: 'room-2', name: 'Tigers Cave', game: 'aadupuli', players: 1, host: 'Chezhiyan' },
    { id: 'room-3', name: 'Dayakattai Arena', game: 'dayakattai', players: 2, host: 'Karikalan' }
  ]);

  const [chats, setChats] = useState<ChatMessage[]>([
    { id: 'c1', sender: 'System', text: 'Welcome to Tamil Heritage Live Lobby Chat!', time: '11:20 AM' },
    { id: 'c2', sender: 'Chezhiyan', text: 'Who is ready for a Dayakattai match? 🎲', time: '11:21 AM' },
    { id: 'c3', sender: 'Madhavi', text: 'Just won in Aadu Puli! Goats strategy is awesome.', time: '11:22 AM' }
  ]);

  const [inputChat, setInputChat] = useState('');
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchmakingStatus, setMatchmakingStatus] = useState('');

  // Auto push mock chats
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const randomChat = MOCK_CHATS[Math.floor(Math.random() * MOCK_CHATS.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setChats(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: randomChat.sender,
          text: randomChat.text,
          time: timeStr
        }
      ].slice(-30)); // limit to 30 messages
    }, 6000);

    return () => clearInterval(chatInterval);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    const username = user?.username || 'Guest';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChats(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: username,
        text: inputChat.trim(),
        time: timeStr
      }
    ]);
    setInputChat('');
  };

  const handleQuickJoin = (gameType: string) => {
    setMatchmaking(true);
    setMatchmakingStatus(language === 'en' ? 'Connecting to lobby...' : 'இணைப்பு ஏற்படுத்தப்படுகிறது...');
    
    setTimeout(() => {
      setMatchmakingStatus(language === 'en' ? 'Finding active players...' : 'விளையாட்டாளர்களைத் தேடுகிறது...');
    }, 1500);

    setTimeout(() => {
      setMatchmakingStatus(language === 'en' ? 'Opponent found! Initializing board...' : 'நண்பர் கிடைத்துவிட்டார்! தொடங்கு...');
    }, 3000);

    setTimeout(() => {
      setMatchmaking(false);
      onLaunchGame(gameType);
    }, 4200);
  };

  const handleCreateRoom = (roomName: string, gameType: string) => {
    const host = user?.username || 'Guest';
    const newRoom = {
      id: Math.random().toString(),
      name: roomName,
      game: gameType,
      players: 1,
      host
    };
    setActiveRooms(prev => [newRoom, ...prev]);
    handleQuickJoin(gameType);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem' }} className="animate-fade">
      
      {/* Search status modal overlay */}
      {matchmaking && (
        <div style={overlayStyle}>
          <div className="glass" style={modalStyle}>
            <div style={spinnerStyle} />
            <h3 style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {language === 'en' ? 'Matchmaking Active' : 'இணைப்பு தேடப்படுகிறது'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{matchmakingStatus}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users /> {t('multiplayer_lobby')}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {language === 'en' 
            ? 'Join active game rooms or match instantly with other traditional players online.' 
            : 'செயலில் உள்ள விளையாட்டு அறைகளில் சேரவும் அல்லது மற்றவர்களுடன் உடனே இணைந்து விளையாடுங்கள்.'}
        </p>
      </div>

      <div style={lobbyGridStyle}>
        
        {/* Rooms lists & Action */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Match panel */}
          <div className="wood-board" style={{ padding: '1.5rem', borderRadius: '14px', color: '#fff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={18} style={{ color: 'var(--secondary)' }} /> Quick Match Arena
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.2rem' }}>
              {language === 'en' 
                ? 'Select a game to instantly join the next available slot or matching player.'
                : 'உடனே விளையாட ஏதேனும் ஒரு விளையாட்டைத் தேர்ந்தெடுக்கவும்.'}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
              {['pallanguzhi', 'aadupuli', 'paramapadham', 'dayakattai'].map(game => (
                <button
                  key={game}
                  onClick={() => handleQuickJoin(game)}
                  style={quickMatchBtnStyle}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{game}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active rooms */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('active_rooms')}</h3>
              <button 
                onClick={() => handleCreateRoom('Heritage Challenge Room', 'pallanguzhi')}
                style={createRoomBtnStyle}
              >
                <Plus size={16} /> {t('create_room')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {activeRooms.map(room => (
                <div 
                  key={room.id} 
                  className="glass" 
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 'bold' }}>{room.name}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '0.2rem' }}>
                      Game: <strong style={{ color: 'var(--primary)' }}>{room.game}</strong> | Host: {room.host}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      👤 {room.players}/2
                    </span>
                    <button
                      onClick={() => handleQuickJoin(room.game)}
                      style={joinRoomBtnStyle}
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Chat Panel */}
        <div 
          className="glass"
          style={{
            flex: '1 1 300px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '420px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <MessageSquare size={16} /> {t('chat')}
          </div>

          {/* Messages list container */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {chats.map(msg => (
              <div key={msg.id} style={{ fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                  <span style={{ fontWeight: 'bold', color: msg.sender === 'System' ? 'var(--primary)' : 'var(--secondary)' }}>
                    {msg.sender}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                </div>
                <div style={{ color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: 1.3 }}>{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendChat} style={{ padding: '0.8rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder={language === 'en' ? 'Type message...' : 'அரட்டையடி...'}
              value={inputChat}
              onChange={e => setInputChat(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="submit"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

const lobbyGridStyle = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap' as const,
  alignItems: 'flex-start'
};

const quickMatchBtnStyle = {
  padding: '0.8rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.12)',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  fontSize: '0.85rem',
  textAlign: 'center' as const,
};

const createRoomBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: 'var(--primary)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.85rem'
};

const joinRoomBtnStyle = {
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: 'var(--primary)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.8rem'
};

const overlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(3px)'
};

const modalStyle = {
  padding: '3rem 2rem',
  borderRadius: '16px',
  textAlign: 'center' as const,
  width: '320px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center'
};

const spinnerStyle = {
  width: '45px',
  height: '45px',
  border: '4px solid var(--border-color)',
  borderTop: '4px solid var(--primary)',
  borderRadius: '50%',
  animation: 'spinSlow 1.5s linear infinite'
};
