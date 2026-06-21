"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const db_1 = require("../config/db");
const memoryStore_1 = require("../config/memoryStore");
const JWT_SECRET = process.env.JWT_SECRET || 'tamil_heritage_games_super_secret_key';
// Helper to construct response user object
const cleanUserResponse = (user) => {
    return {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        title: user.title,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        gameStats: user.gameStats,
        createdAt: user.createdAt
    };
};
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email address format' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        // Check if user exists
        if (db_1.isMongoConnected) {
            const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            // Hash password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const newUser = new User_1.default({
                username,
                email,
                password: hashedPassword
            });
            await newUser.save();
            const token = jsonwebtoken_1.default.sign({ id: newUser._id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ token, user: cleanUserResponse(newUser) });
        }
        else {
            const existingUser = memoryStore_1.memoryUsers.find(u => u.username === username || u.email === email);
            if (existingUser) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const newUser = {
                id: Math.random().toString(36).substring(2, 9),
                username,
                email,
                passwordHash: hashedPassword,
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
                createdAt: new Date()
            };
            memoryStore_1.memoryUsers.push(newUser);
            const token = jsonwebtoken_1.default.sign({ id: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ token, user: cleanUserResponse(newUser) });
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'Username/Email and Password are required' });
        }
        if (db_1.isMongoConnected) {
            const user = await User_1.default.findOne({
                $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
            });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: cleanUserResponse(user) });
        }
        else {
            const user = memoryStore_1.memoryUsers.find(u => u.email === emailOrUsername || u.username === emailOrUsername);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: cleanUserResponse(user) });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (db_1.isMongoConnected) {
            const user = await User_1.default.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(cleanUserResponse(user));
        }
        else {
            const user = memoryStore_1.memoryUsers.find(u => u.id === userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(cleanUserResponse(user));
        }
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
exports.getProfile = getProfile;
