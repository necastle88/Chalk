"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("@clerk/express");
const workouts_1 = __importDefault(require("./routes/workouts"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Basic middleware setup
app.use((0, cors_1.default)({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
// Routes
app.get('/', (req, res) => {
    res.send('Server running 🚀');
});
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/workouts', workouts_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
