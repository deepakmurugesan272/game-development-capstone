import { Router } from 'express';
import { recordGame, getLeaderboard, getHistory } from '../controllers/gameController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Record game matches (anonymous can write, but optionally authenticated)
router.post('/record', recordGame);
router.get('/leaderboard', getLeaderboard);
router.get('/history', getHistory);

export default router;
