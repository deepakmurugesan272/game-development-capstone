import { Response } from 'express';
import GameRecord from '../models/GameRecord';
import User from '../models/User';
import { isMongoConnected } from '../config/db';
import { memoryUsers, memoryGameRecords, MemoryGameRecord } from '../config/memoryStore';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to determine title based on statistics
const getNewTitle = (stats: any, currentTitle: string): string => {
  const titles = [
    { cond: () => (stats.aadupuli?.wins || 0) >= 5, title: 'Tiger Strategist' },
    { cond: () => (stats.pallanguzhi?.wins || 0) >= 5, title: 'Seed Master' },
    { cond: () => (stats.paramapadham?.wins || 0) >= 5, title: 'Virtuous Soul' },
    { cond: () => (stats.dayakattai?.wins || 0) >= 5, title: 'Dhaayam Emperor' },
    {
      cond: () =>
        ((stats.aadupuli?.wins || 0) +
          (stats.pallanguzhi?.wins || 0) +
          (stats.paramapadham?.wins || 0) +
          (stats.dayakattai?.wins || 0)) >= 15,
      title: 'Tamil Heritage Legend'
    }
  ];

  for (const t of titles) {
    if (t.cond()) return t.title;
  }
  return currentTitle || 'Heritage Learner';
};

export const recordGame = async (req: AuthenticatedRequest, res: Response) => {
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

    let savedRecord: any;

    if (isMongoConnected) {
      const record = new GameRecord(recordPayload);
      savedRecord = await record.save();

      // Update stats for all registered players in the game
      for (const username of players) {
        if (username === 'AI' || username === 'Guest') continue;

        const user = await User.findOne({ username });
        if (!user) continue;

        const isWinner = winner === username;
        const isDraw = winner === 'Draw';
        const gameStat = user.gameStats[gameType] || { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 };

        gameStat.played += 1;
        if (isWinner) {
          gameStat.wins += 1;
          user.xp += 50;
          user.coins += 25;
        } else if (isDraw) {
          gameStat.draws += 1;
          user.xp += 20;
          user.coins += 10;
        } else {
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
    } else {
      // In-Memory Mode
      const recordId = Math.random().toString(36).substring(2, 9);
      const newRecord: MemoryGameRecord = {
        id: recordId,
        gameType,
        players,
        winner,
        scores: scores || {},
        durationSeconds: durationSeconds || 0,
        status: 'completed',
        createdAt: new Date()
      };
      memoryGameRecords.push(newRecord);
      savedRecord = newRecord;

      for (const username of players) {
        if (username === 'AI' || username === 'Guest') continue;

        const user = memoryUsers.find(u => u.username === username);
        if (!user) continue;

        const isWinner = winner === username;
        const isDraw = winner === 'Draw';
        const gameStat = user.gameStats[gameType] || { played: 0, wins: 0, losses: 0, draws: 0, highScore: 0 };

        gameStat.played += 1;
        if (isWinner) {
          gameStat.wins += 1;
          user.xp += 50;
          user.coins += 25;
        } else if (isDraw) {
          gameStat.draws += 1;
          user.xp += 20;
          user.coins += 10;
        } else {
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
  } catch (error: any) {
    console.error('Record game error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { game } = req.query;

    if (isMongoConnected) {
      let leaderboardData;
      if (game && game !== 'all') {
        const queryKey = `gameStats.${game}.wins`;
        leaderboardData = await User.find({})
          .sort({ [queryKey]: -1, xp: -1 })
          .limit(10)
          .select('username profilePic title xp level gameStats');
      } else {
        leaderboardData = await User.find({})
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
          ? (user.gameStats as any)?.[game as string]?.wins || 0 
          : Object.values(user.gameStats as any).reduce((acc: number, curr: any) => acc + (curr?.wins || 0), 0)
      }));

      return res.json(formatted);
    } else {
      // In-Memory Mode
      let sortedUsers = [...memoryUsers];
      if (game && game !== 'all') {
        sortedUsers.sort((a, b) => {
          const aWins = a.gameStats[game as string]?.wins || 0;
          const bWins = b.gameStats[game as string]?.wins || 0;
          if (aWins !== bWins) return bWins - aWins;
          return b.xp - a.xp;
        });
      } else {
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
          ? user.gameStats[game as string]?.wins || 0
          : Object.values(user.gameStats).reduce((acc, curr) => acc + (curr.wins || 0), 0)
      }));

      return res.json(formatted);
    }
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Username parameter is required' });
    }

    if (isMongoConnected) {
      const records = await GameRecord.find({ players: username })
        .sort({ createdAt: -1 })
        .limit(20);
      return res.json(records);
    } else {
      const records = memoryGameRecords
        .filter(r => r.players.includes(username as string))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20);
      return res.json(records);
    }
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
