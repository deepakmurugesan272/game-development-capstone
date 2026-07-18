import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  highScore: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  title: string;
  xp: number;
  level: number;
  coins: number;
  gameStats: {
    pallanguzhi: UserStats;
    aadupuli: UserStats;
    paramapadham: UserStats;
    dayakattai: UserStats;
  };
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  recordGameResult: (
    gameType: 'pallanguzhi' | 'aadupuli' | 'paramapadham' | 'dayakattai',
    players: string[],
    winner: string,
    scores?: Record<string, number>,
    durationSeconds?: number
  ) => Promise<void>;
  fetchLeaderboard: (game: string) => Promise<any[]>;
  fetchHistory: (username: string) => Promise<any[]>;
  updateGuestCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local Storage keys
const TOKEN_KEY = 'thgh_token';
const USER_KEY = 'thgh_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      console.warn('API login failed, running client-side authentication fallback:', err.message);
      
      // Client-side fallback: check local mock storage
      const localUsers = JSON.parse(localStorage.getItem('thgh_fallback_users') || '[]');
      // Also check standard mock names
      const mockMatches = [
        { username: 'Bharathi', email: 'bharathi@heritage.org' },
        { username: 'Senthil', email: 'senthil@heritage.org' },
        { username: 'Anjali', email: 'anjali@heritage.org' },
        { username: 'Vasanth', email: 'vasanth@heritage.org' }
      ];
      
      let matchedUser = localUsers.find((u: any) => u.username === emailOrUsername || u.email === emailOrUsername);
      if (!matchedUser && mockMatches.some(m => m.username === emailOrUsername || m.email === emailOrUsername)) {
        // Create mock user profile
        matchedUser = {
          id: 'mock_' + emailOrUsername.toLowerCase(),
          username: emailOrUsername,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@heritage.org`,
          profilePic: 'avatar1',
          title: 'Heritage Master',
          xp: 1500,
          level: 16,
          coins: 500,
          gameStats: {
            pallanguzhi: { played: 15, wins: 10, losses: 4, draws: 1, highScore: 30 },
            aadupuli: { played: 12, wins: 8, losses: 4, draws: 0, highScore: 0 },
            paramapadham: { played: 8, wins: 4, losses: 4, draws: 0, highScore: 100 },
            dayakattai: { played: 20, wins: 14, losses: 6, draws: 0, highScore: 4 }
          },
          createdAt: new Date().toISOString()
        };
      }

      if (!matchedUser && emailOrUsername === 'admin') {
        matchedUser = {
          id: 'admin_id',
          username: 'admin',
          email: 'admin@heritage.org',
          profilePic: 'avatar1',
          title: 'Founder Custodian',
          xp: 3000,
          level: 31,
          coins: 1000,
          gameStats: {
            pallanguzhi: { played: 10, wins: 8, losses: 2, draws: 0, highScore: 38 },
            aadupuli: { played: 10, wins: 9, losses: 1, draws: 0, highScore: 0 },
            paramapadham: { played: 5, wins: 3, losses: 2, draws: 0, highScore: 100 },
            dayakattai: { played: 10, wins: 7, losses: 3, draws: 0, highScore: 4 }
          },
          createdAt: new Date().toISOString()
        };
      }

      if (matchedUser && password === 'password123') {
        const dummyToken = 'dummy_token_' + matchedUser.id;
        setToken(dummyToken);
        setUser(matchedUser);
        localStorage.setItem(TOKEN_KEY, dummyToken);
        localStorage.setItem(USER_KEY, JSON.stringify(matchedUser));
        return { success: true };
      }

      return { success: false, message: 'Invalid credentials. (Hint: Try username "admin" and password "password123")' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      console.warn('API register failed, running client-side authentication fallback:', err.message);

      const localUsers = JSON.parse(localStorage.getItem('thgh_fallback_users') || '[]');
      if (localUsers.some((u: any) => u.username === username || u.email === email)) {
        return { success: false, message: 'Username or email already exists in client database.' };
      }

      const newUser: UserProfile = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        username,
        email,
        profilePic: 'avatar1',
        title: 'Heritage Learner',
        xp: 0,
        level: 1,
        coins: 100,
        gameStats: {
          pallanguzhi: { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 },
          aadupuli: { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 },
          paramapadham: { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 },
          dayakattai: { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 }
        },
        createdAt: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem('thgh_fallback_users', JSON.stringify(localUsers));
      
      const dummyToken = 'dummy_token_' + newUser.id;
      setToken(dummyToken);
      setUser(newUser);
      localStorage.setItem(TOKEN_KEY, dummyToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return { success: true };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const recordGameResult = async (
    gameType: 'pallanguzhi' | 'aadupuli' | 'paramapadham' | 'dayakattai',
    players: string[],
    winner: string,
    scores?: Record<string, number>,
    durationSeconds = 60
  ) => {
    try {
      const response = await fetch('/api/games/record', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ gameType, players, winner, scores, durationSeconds })
      });
      
      if (response.ok && token) {
        // refresh profile statistics
        const profileResp = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileResp.ok) {
          const updatedUser = await profileResp.json();
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
        return;
      }
      throw new Error('Fallback required');
    } catch (err) {
      console.warn('API recordGameResult failed, updating locally in client memory...');
      
      // Fallback update local user state
      if (user) {
        const username = user.username;
        const isWinner = winner === username;
        const isDraw = winner === 'Draw';
        
        const currentStats = { ...(user.gameStats[gameType] || { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 }) };
        currentStats.played += 1;
        
        let xpGained = 10;
        let coinsGained = 0;
        
        if (isWinner) {
          currentStats.wins += 1;
          xpGained = 50;
          coinsGained = 25;
        } else if (isDraw) {
          currentStats.draws += 1;
          xpGained = 20;
          coinsGained = 10;
        } else {
          currentStats.losses += 1;
        }
        
        const score = scores?.[username] || 0;
        if (score > currentStats.highScore) {
          currentStats.highScore = score;
        }
        
        const updatedStats = { ...user.gameStats, [gameType]: currentStats };
        const newXp = user.xp + xpGained;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        let newTitle = user.title;
        if (currentStats.wins >= 5) {
          if (gameType === 'aadupuli') newTitle = 'Tiger Strategist';
          if (gameType === 'pallanguzhi') newTitle = 'Seed Master';
          if (gameType === 'paramapadham') newTitle = 'Virtuous Soul';
          if (gameType === 'dayakattai') newTitle = 'Dhaayam Emperor';
        }
        
        const updatedUser: UserProfile = {
          ...user,
          xp: newXp,
          level: newLevel,
          coins: user.coins + coinsGained,
          title: newTitle,
          gameStats: updatedStats
        };
        
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        
        // Also update in client-side registered list if exists
        const localUsers = JSON.parse(localStorage.getItem('thgh_fallback_users') || '[]');
        const idx = localUsers.findIndex((u: any) => u.id === user.id);
        if (idx !== -1) {
          localUsers[idx] = updatedUser;
          localStorage.setItem('thgh_fallback_users', JSON.stringify(localUsers));
        }

        // Add to history
        const localHistory = JSON.parse(localStorage.getItem('thgh_fallback_history') || '[]');
        localHistory.push({
          id: Math.random().toString(36).substring(2, 9),
          gameType,
          players,
          winner,
          scores,
          durationSeconds,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('thgh_fallback_history', JSON.stringify(localHistory));
      }
    }
  };

  const updateGuestCoins = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, coins: Math.max(0, user.coins + amount) };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const fetchLeaderboard = async (game: string) => {
    try {
      const response = await fetch(`/api/games/leaderboard?game=${game}`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (err) {
      console.warn('API leaderboard failed, retrieving local mock standings');
      // Local mockup standings
      const localUsers = JSON.parse(localStorage.getItem('thgh_fallback_users') || '[]');
      const defaultMockList = [
        { username: 'Bharathi', title: 'Tamil Heritage Legend', xp: 2250, level: 23, wins: 76, profilePic: 'avatar2' },
        { username: 'Senthil', title: 'Tiger Strategist', xp: 1500, level: 16, wins: 44, profilePic: 'avatar3' },
        { username: 'Anjali', title: 'Seed Master', xp: 1200, level: 13, wins: 30, profilePic: 'avatar4' },
        { username: 'Vasanth', title: 'Dhaayam Emperor', xp: 950, level: 10, wins: 26, profilePic: 'avatar1' }
      ];

      // Add current user if they are logged in and aren't already represented
      if (user && !defaultMockList.some(m => m.username === user.username)) {
        const totalWins = Object.values(user.gameStats).reduce((acc, curr) => acc + curr.wins, 0);
        defaultMockList.push({
          username: user.username,
          title: user.title,
          xp: user.xp,
          level: user.level,
          wins: totalWins,
          profilePic: user.profilePic
        });
      }

      // Add other registered fallback users
      localUsers.forEach((u: any) => {
        if (user?.username !== u.username && !defaultMockList.some(m => m.username === u.username)) {
          const totalWins = Object.values(u.gameStats).reduce((acc: number, curr: any) => acc + curr.wins, 0);
          defaultMockList.push({
            username: u.username,
            title: u.title,
            xp: u.xp,
            level: u.level,
            wins: totalWins,
            profilePic: u.profilePic
          });
        }
      });

      // Sort
      defaultMockList.sort((a, b) => b.xp - a.xp);
      return defaultMockList.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
  };

  const fetchHistory = async (username: string) => {
    try {
      const response = await fetch(`/api/games/history?username=${username}`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (err) {
      const localHistory = JSON.parse(localStorage.getItem('thgh_fallback_history') || '[]');
      return localHistory
        .filter((r: any) => r.players.includes(username))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        recordGameResult,
        fetchLeaderboard,
        fetchHistory,
        updateGuestCoins
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
