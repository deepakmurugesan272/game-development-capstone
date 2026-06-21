"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const router = (0, express_1.Router)();
// Record game matches (anonymous can write, but optionally authenticated)
router.post('/record', gameController_1.recordGame);
router.get('/leaderboard', gameController_1.getLeaderboard);
router.get('/history', gameController_1.getHistory);
exports.default = router;
