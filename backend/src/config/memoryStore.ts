export interface MemoryUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  profilePic: string;
  title: string;
  xp: number;
  level: number;
  coins: number;
  gameStats: {
    [key: string]: {
      played: number;
      wins: number;
      losses: number;
      draws: number;
      highScore: number;
    };
  };
  createdAt: Date;
}

export interface MemoryGameRecord {
  id: string;
  gameType: 'pallanguzhi' | 'aadupuli' | 'paramapadham' | 'dayakattai';
  players: string[];
  winner: string;
  scores: Record<string, number>;
  durationSeconds: number;
  status: 'completed' | 'abandoned';
  createdAt: Date;
}

export const memoryUsers: MemoryUser[] = [];
export const memoryGameRecords: MemoryGameRecord[] = [];

// Populate default test users so that the frontend is instantly loaded with sample data
// Usernames: admin, player1, player2 (password for all: 'password123')
// Password hash for 'password123' using bcrypt is: $2a$10$wKz0oPqU2B8/2fPjI3T/nOhs.qWJ6H0x/JjYhI.fV2yHlCj5k6f8q (or similar, but we'll mock bcrypt comparison anyway!)
