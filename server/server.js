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
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://ecoguard-nu.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('✅ Body Parsers registered');

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
console.log('✅ Session registered');

app.use(passport.initialize());
console.log('✅ Passport Init registered');
app.use(passport.session());
console.log('✅ Passport Session registered');

// ─── Routes ──────────────────────────────────────────────────────────────────
console.log('🛣️ Registering Routes...');
app.use('/auth', authRoutes);
console.log('✅ Auth Routes registered');
app.use('/auth/gamification', gamificationRoutes);
console.log('✅ Gamification Routes registered');

// Health check
app.get('/', (req, res) => res.json({ status: 'EcoGuard API running ✅' }));
console.log('✅ Health Check registered');

// ─── IoT Sensor Network Endpoints ───────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
    res.json({
        status: 'success',
        current_adc: 1402,
        cumulative_daily: 43891,
        projected_final: 118294,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        points: [
            { time: '08:00', emissions: 12000 },
            { time: '10:00', emissions: 18500 },
            { time: '12:00', emissions: 32000 },
            { time: '14:00', emissions: 45000 },
            { time: '16:00', emissions: 65000 },
            { time: '18:00', emissions: 82000 },
            { time: '20:00', emissions: 95000 },
            { time: '22:00', emissions: 108000 },
            { time: '00:00 (Proj)', emissions: 118294 }
        ]
    });
});

app.get('/api/audit', (req, res) => {
    res.json({
        status: 'success',
        timestamp: new Date().toLocaleString(),
        transactions_audited: 124,
        exhaust_flow_rate: 15.2,
        peak_concentration_ppm: 438,
        total_co_emitted_kg: 84.12,
        contract_address: "0x8920...24E5 (Sepolia Testnet)"
    });
});
console.log('✅ IoT Endpoints registered');

// ─── Connect & Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5005;

console.log('🗄️ Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
        app.listen(PORT, '0.0.0.0', () => {
             console.log(`🚀 Production Server is LIVE on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ FATAL: MongoDB connection failed!');
        console.error('Error details:', err);
        process.exit(1);
    });
