import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB, isMongoConnected } from './config/db';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import { memoryUsers } from './config/memoryStore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongoConnected: isMongoConnected,
    timestamp: new Date()
  });
});

// Seed default users in memoryStore if not using Mongo (or even if using Mongo, print info)
const seedMemoryUsers = () => {
  const defaultPasswordHash = bcrypt.hashSync('password123', 10);
  
  const mockUsers = [
    {
      id: 'mock1',
      username: 'Bharathi',
      email: 'bharathi@heritage.org',
      passwordHash: defaultPasswordHash,
      profilePic: 'avatar2',
      title: 'Tamil Heritage Legend',
      xp: 2250,
      level: 23,
      coins: 450,
      gameStats: {
        pallanguzhi: { played: 30, wins: 22, losses: 6, draws: 2, highScore: 48 },
        aadupuli: { played: 25, wins: 18, losses: 7, draws: 0, highScore: 0 },
        paramapadham: { played: 15, wins: 8, losses: 7, draws: 0, highScore: 100 },
        dayakattai: { played: 40, wins: 28, losses: 12, draws: 0, highScore: 4 }
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock2',
      username: 'Senthil',
      email: 'senthil@heritage.org',
      passwordHash: defaultPasswordHash,
      profilePic: 'avatar3',
      title: 'Tiger Strategist',
      xp: 1500,
      level: 16,
      coins: 300,
      gameStats: {
        pallanguzhi: { played: 20, wins: 11, losses: 8, draws: 1, highScore: 36 },
        aadupuli: { played: 35, wins: 21, losses: 14, draws: 0, highScore: 0 },
        paramapadham: { played: 10, wins: 4, losses: 6, draws: 0, highScore: 100 },
        dayakattai: { played: 15, wins: 8, losses: 7, draws: 0, highScore: 2 }
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock3',
      username: 'Anjali',
      email: 'anjali@heritage.org',
      passwordHash: defaultPasswordHash,
      profilePic: 'avatar4',
      title: 'Seed Master',
      xp: 1200,
      level: 13,
      coins: 240,
      gameStats: {
        pallanguzhi: { played: 25, wins: 16, losses: 8, draws: 1, highScore: 42 },
        aadupuli: { played: 10, wins: 4, losses: 6, draws: 0, highScore: 0 },
        paramapadham: { played: 12, wins: 5, losses: 7, draws: 0, highScore: 100 },
        dayakattai: { played: 10, wins: 5, losses: 5, draws: 0, highScore: 1 }
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'mock4',
      username: 'Vasanth',
      email: 'vasanth@heritage.org',
      passwordHash: defaultPasswordHash,
      profilePic: 'avatar1',
      title: 'Dhaayam Emperor',
      xp: 950,
      level: 10,
      coins: 180,
      gameStats: {
        pallanguzhi: { played: 12, wins: 6, losses: 5, draws: 1, highScore: 28 },
        aadupuli: { played: 12, wins: 5, losses: 7, draws: 0, highScore: 0 },
        paramapadham: { played: 8, wins: 3, losses: 5, draws: 0, highScore: 100 },
        dayakattai: { played: 20, wins: 12, losses: 8, draws: 0, highScore: 3 }
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  memoryUsers.push(...mockUsers);
  console.log('✔ Seeded 4 Mock Users in-memory for immediate play and leaderboard visibility.');
};

// Initialize server
const startServer = async () => {
  await connectDB();
  seedMemoryUsers();
  
  app.listen(PORT, () => {
    console.log(`🚀 Tamil Heritage Games Hub Backend listening on port ${PORT}`);
  });
};

startServer();
