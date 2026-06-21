import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    brand_title: 'Tamil Heritage Games',
    brand_subtitle: 'Tamil Games Hub',
    dashboard: 'Dashboard',
    leaderboard: 'Leaderboard',
    rules_history: 'Rules & History',
    profile: 'Profile',
    login: 'Log In',
    logout: 'Logout',
    welcome_hero: 'Preserving Culture, One Turn at a Time',
    welcome_desc: 'Play fully interactive versions of classical Tamil board games. Compete against smart AI opponents, log statistics, claim traditional titles, and rise in the leaderboard!',
    select_game: 'Select a Heritage Game',
    guest_mode: 'Guest Mode Active',
    guest_desc: 'Sign in or create an account to record your scores, win coins, and earn traditional titles!',
    level: 'LEVEL',
    xp: 'XP',
    coins: 'COINS',
    wins: 'TOTAL WINS',
    play_now: 'Play Now',
    daily_challenges: 'Daily Challenges',
    streak: 'Login Streak',
    days: 'days',
    claim_reward: 'Claim Reward',
    tutorial_mode: 'Tutorial Mode',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    reset: 'Reset',
    vs_ai: 'vs AI',
    pass_play: 'Pass & Play',
    multiplayer_lobby: 'Multiplayer Lobby',
    create_room: 'Create Room',
    quick_join: 'Quick Join',
    active_rooms: 'Active Rooms',
    chat: 'Lobby Chat',
    history_log: 'Recent Match Log',
    stat_played: 'Total Played',
    stat_won: 'Matches Won',
    stat_rate: 'Win Rate',
    stat_coins: 'Heritage Coins',
    how_to_play: 'How to Play',
    cultural_history: 'Cultural History & Origin',
    detailed_rules: 'Detailed Rulebook',
    loading: 'Loading data...',
    rank: 'Rank',
    player: 'Player',
    title: 'Title',
    score: 'Score'
  },
  ta: {
    brand_title: 'தமிழ் பாரம்பரியம்',
    brand_subtitle: 'விளையாட்டு மையம்',
    dashboard: 'முகப்பு',
    leaderboard: 'மதிப்பீட்டுப் பலகை',
    rules_history: 'விதிமுறைகள் & வரலாறு',
    profile: 'சுயவிவரம்',
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    welcome_hero: 'பண்பாட்டைக் காப்போம், விளையாடி மகிழ்வோம்',
    welcome_desc: 'பாரம்பரிய தமிழ் விளையாட்டுகளை விளையாடி மகிழுங்கள். கணினிக்கு எதிராக போட்டியிட்டு, புள்ளிகளைச் சேகரித்து, பட்டங்களை வென்று, முன்னிலை பலகையில் முன்னேறுங்கள்!',
    select_game: 'பாரம்பரிய விளையாட்டைத் தேர்ந்தெடுக்கவும்',
    guest_mode: 'விருந்தினராக விளையாடுகிறீர்கள்',
    guest_desc: 'விளையாட்டுப் புள்ளிகளைச் சேமிக்கவும், நாணயங்களைப் பெறவும், பட்டங்களை வெல்லவும் கணக்கைத் தொடங்கவும்!',
    level: 'நிலை',
    xp: 'அனுபவம் (XP)',
    coins: 'நாணயங்கள்',
    wins: 'மொத்த வெற்றிகள்',
    play_now: 'விளையாடு',
    daily_challenges: 'தினசரி சவால்கள்',
    streak: 'தொடர் வருகை',
    days: 'நாட்கள்',
    claim_reward: 'பரிசைப் பெறு',
    tutorial_mode: 'பயிற்சி முறை',
    difficulty: 'கடினத்தன்மை',
    easy: 'எளிது',
    medium: 'நடுத்தரம்',
    hard: 'கடினம்',
    reset: 'மீட்டமை',
    vs_ai: 'கணினியுடன்',
    pass_play: 'நண்பருடன் (உள்ளூர்)',
    multiplayer_lobby: 'மல்டிபிளேயர் அரங்கம்',
    create_room: 'அறையை உருவாக்கு',
    quick_join: 'உடனே சேர்',
    active_rooms: 'செயலில் உள்ள அறைகள்',
    chat: 'அரட்டை',
    history_log: 'சமீபத்திய விளையாட்டு பதிவு',
    stat_played: 'விளையாடியவை',
    stat_won: 'வென்றவை',
    stat_rate: 'வெற்றி விகிதம்',
    stat_coins: 'நாணயங்கள்',
    how_to_play: 'விளையாடும் முறை',
    cultural_history: 'வரலாற்றுப் பின்னணி',
    detailed_rules: 'விளையாட்டு விதிகள்',
    loading: 'தரவு ஏற்றப்படுகிறது...',
    rank: 'தரவரிசை',
    player: 'விளையாட்டாளர்',
    title: 'பட்டம்',
    score: 'மதிப்பெண்'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'ta') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
