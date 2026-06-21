"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.getLeaderboard = exports.recordGame = void 0;
const GameRecord_1 = __importDefault(require("../models/GameRecord"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = require("../config/db");
const memoryStore_1 = require("../config/memoryStore");
// Helper to determine title based on statistics
const getNewTitle = (stats, currentTitle) => {
    const titles = [
        { cond: () => (stats.aadupuli?.wins || 0) >= 5, title: 'Tiger Strategist' },
        { cond: () => (stats.pallanguzhi?.wins || 0) >= 5, title: 'Seed Master' },
        { cond: () => (stats.paramapadham?.wins || 0) >= 5, title: 'Virtuous Soul' },
        { cond: () => (stats.dayakattai?.wins || 0) >= 5, title: 'Dhaayam Emperor' },
        {
            cond: () => ((stats.aadupuli?.wins || 0) +
                (stats.pallanguzhi?.wins || 0) +
                (stats.paramapadham?.wins || 0) +
                (stats.dayakattai?.wins || 0)) >= 15,
            title: 'Tamil Heritage Legend'
        }
    ];
    for (const t of titles) {
        if (t.cond())
            return t.title;
    }
    return currentTitle || 'Heritage Learner';
};
const recordGame = async (req, res) => {
    try {
        const { gameType, players, winner, scores, durationSeconds } = req.body;
        if (!gameType || !players || !Array.isArray(players)) {
            return res.status(400).json({ message: 'Invalid game record payload' });
        }
        const recordPayload = {
            gameType,
            players,
            winner,
            scores: scores || {},
            durationSeconds: durationSeconds || 0,
            status: 'completed',
            createdAt: new Date()
        };
        let savedRecord;
        if (db_1.isMongoConnected) {
            const record = new GameRecord_1.default(recordPayload);
            savedRecord = await record.save();
            // Update stats for all registered players in the game
            for (const username of players) {
                if (username === 'AI' || username === 'Guest')
                    continue;
                const user = await User_1.default.findOne({ username });
                if (!user)
                    continue;
                const isWinner = winner === username;
                const isDraw = winner === 'Draw';
                const gameStat = user.gameStats[gameType] || { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 };
                gameStat.played += 1;
                if (isWinner) {
                    gameStat.wins += 1;
                    user.xp += 50;
                    user.coins += 25;
                }
                else if (isDraw) {
                    gameStat.draws += 1;
                    user.xp += 20;
                    user.coins += 10;
                }
                else {
                    gameStat.losses += 1;
                    user.xp += 10;
                }
                const score = scores?.[username] || 0;
                if (score > gameStat.highScore) {
                    gameStat.highScore = score;
                }
                user.gameStats[gameType] = gameStat;
                // Level calculation: 100 XP per level
                user.level = Math.floor(user.xp / 100) + 1;
                user.title = getNewTitle(user.gameStats, user.title);
                await user.save();
            }
        }
        else {
            // In-Memory Mode
            const recordId = Math.random().toString(36).substring(2, 9);
            const newRecord = {
                id: recordId,
                gameType,
                players,
                winner,
                scores: scores || {},
                durationSeconds: durationSeconds || 0,
                status: 'completed',
                createdAt: new Date()
            };
            memoryStore_1.memoryGameRecords.push(newRecord);
            savedRecord = newRecord;
            for (const username of players) {
                if (username === 'AI' || username === 'Guest')
                    continue;
                const user = memoryStore_1.memoryUsers.find(u => u.username === username);
                if (!user)
                    continue;
                const isWinner = winner === username;
                const isDraw = winner === 'Draw';
                const gameStat = user.gameStats[gameType] || { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 };
                gameStat.played += 1;
                if (isWinner) {
                    gameStat.wins += 1;
                    user.xp += 50;
                    user.coins += 25;
                }
                else if (isDraw) {
                    gameStat.draws += 1;
                    user.xp += 20;
                    user.coins += 10;
                }
                else {
                    gameStat.losses += 1;
                    user.xp += 10;
                }
                const score = scores?.[username] || 0;
                if (score > gameStat.highScore) {
                    gameStat.highScore = score;
                }
                user.gameStats[gameType] = gameStat;
                user.level = Math.floor(user.xp / 100) + 1;
                user.title = getNewTitle(user.gameStats, user.title);
            }
        }
        return res.status(201).json({ message: 'Game recorded successfully', record: savedRecord });
    }
    catch (error) {
        console.error('Record game error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.recordGame = recordGame;
const getLeaderboard = async (req, res) => {
    try {
        const { game } = req.query;
        if (db_1.isMongoConnected) {
            let leaderboardData;
            if (game && game !== 'all') {
                const queryKey = `gameStats.${game}.wins`;
                leaderboardData = await User_1.default.find({})
                    .sort({ [queryKey]: -1, xp: -1 })
                    .limit(10)
                    .select('username profilePic title xp level gameStats');
            }
            else {
                leaderboardData = await User_1.default.find({})
                    .sort({ xp: -1 })
                    .limit(10)
                    .select('username profilePic title xp level gameStats');
            }
            const formatted = leaderboardData.map((user, index) => ({
                rank: index + 1,
                username: user.username,
                profilePic: user.profilePic,
                title: user.title,
                xp: user.xp,
                level: user.level,
                wins: game && game !== 'all'
                    ? user.gameStats?.[game]?.wins || 0
                    : Object.values(user.gameStats).reduce((acc, curr) => acc + (curr?.wins || 0), 0)
            }));
            return res.json(formatted);
        }
        else {
            // In-Memory Mode
            let sortedUsers = [...memoryStore_1.memoryUsers];
            if (game && game !== 'all') {
                sortedUsers.sort((a, b) => {
                    const aWins = a.gameStats[game]?.wins || 0;
                    const bWins = b.gameStats[game]?.wins || 0;
                    if (aWins !== bWins)
                        return bWins - aWins;
                    return b.xp - a.xp;
                });
            }
            else {
                sortedUsers.sort((a, b) => b.xp - a.xp);
            }
            const formatted = sortedUsers.slice(0, 10).map((user, index) => ({
                rank: index + 1,
                username: user.username,
                profilePic: user.profilePic,
                title: user.title,
                xp: user.xp,
                level: user.level,
                wins: game && game !== 'all'
                    ? user.gameStats[game]?.wins || 0
                    : Object.values(user.gameStats).reduce((acc, curr) => acc + (curr.wins || 0), 0)
            }));
            return res.json(formatted);
        }
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.getLeaderboard = getLeaderboard;
const getHistory = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ message: 'Username parameter is required' });
        }
        if (db_1.isMongoConnected) {
            const records = await GameRecord_1.default.find({ players: username })
                .sort({ createdAt: -1 })
                .limit(20);
            return res.json(records);
        }
        else {
            const records = memoryStore_1.memoryGameRecords
                .filter(r => r.players.includes(username))
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 20);
            return res.json(records);
        }
    }
    catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.getHistory = getHistory;
