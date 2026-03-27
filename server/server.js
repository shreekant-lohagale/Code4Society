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
        secure: false,      // set true only with HTTPS in production
        maxAge: 60000       // 60 seconds — just enough for OAuth redirect
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
        console.log('✅ MongoDB Atlas connected');
        app.listen(PORT, () =>
            console.log(`🚀 Server running at http://localhost:${PORT}`)
        );
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
