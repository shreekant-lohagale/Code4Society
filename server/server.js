import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import gamificationRoutes from './routes/gamification.js';
import './config/passport.js';

dotenv.config();

const app = express();

console.log('🔄 EcoGuard API Initializing...');
if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is missing from environment variables!');
}
if (!process.env.JWT_SECRET) {
    console.error('❌ WARNING: JWT_SECRET is missing!');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (required for Passport OAuth redirect flow)
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
        maxAge: 600000 // 10 minutes
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/auth/gamification', gamificationRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'EcoGuard API running ✅' }));

// ─── Connect & Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5005;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
        app.listen(PORT, () => {
             console.log(`🚀 Production Server is LIVE on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ FATAL: MongoDB connection failed!');
        console.error('Error details:', err);
        process.exit(1);
    });
