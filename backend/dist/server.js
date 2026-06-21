"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const memoryStore_1 = require("./config/memoryStore");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Routing
app.use('/api/auth', authRoutes_1.default);
app.use('/api/games', gameRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        mongoConnected: db_1.isMongoConnected,
        timestamp: new Date()
    });
});
// Seed default users in memoryStore if not using Mongo (or even if using Mongo, print info)
const seedMemoryUsers = () => {
    const defaultPasswordHash = bcryptjs_1.default.hashSync('password123', 10);
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
    memoryStore_1.memoryUsers.push(...mockUsers);
    console.log('✔ Seeded 4 Mock Users in-memory for immediate play and leaderboard visibility.');
};
// Initialize server
const startServer = async () => {
    await (0, db_1.connectDB)();
    seedMemoryUsers();
    app.listen(PORT, () => {
        console.log(`🚀 Tamil Heritage Games Hub Backend listening on port ${PORT}`);
    });
};
startServer();
