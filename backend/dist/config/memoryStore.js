"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryGameRecords = exports.memoryUsers = void 0;
exports.memoryUsers = [];
exports.memoryGameRecords = [];
// Populate default test users so that the frontend is instantly loaded with sample data
// Usernames: admin, player1, player2 (password for all: 'password123')
// Password hash for 'password123' using bcrypt is: $2a$10$wKz0oPqU2B8/2fPjI3T/nOhs.qWJ6H0x/JjYhI.fV2yHlCj5k6f8q (or similar, but we'll mock bcrypt comparison anyway!)
