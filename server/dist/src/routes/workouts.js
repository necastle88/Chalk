"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_validator_1 = require("express-validator");
const express_2 = require("@clerk/express");
const workoutService_1 = require("../services/workoutService");
const exerciseDetectionService_1 = require("../services/exerciseDetectionService");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// OWASP Security: Rate limiting
const workoutRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many workout requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const aiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit AI calls to 20 per minute per IP
    message: 'Too many AI requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiting to all workout routes
router.use(workoutRateLimit);
// OWASP Security: Input validation middleware
const validateWorkoutLog = [
    (0, express_validator_1.body)('exerciseDescription')
        .isString()
        .isLength({ min: 1, max: 200 })
        .trim()
        .escape()
        .withMessage('Exercise description must be 1-200 characters'),
    (0, express_validator_1.body)('sets')
        .isInt({ min: 1, max: 50 })
        .withMessage('Sets must be between 1 and 50'),
    (0, express_validator_1.body)('reps')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Reps must be between 1 and 1000'),
    (0, express_validator_1.body)('weight')
        .isFloat({ min: 0, max: 2000 })
        .withMessage('Weight must be between 0 and 2000'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 0, max: 3600 })
        .withMessage('Duration must be between 0 and 3600 seconds'),
    (0, express_validator_1.body)('restDuration')
        .optional()
        .isInt({ min: 0, max: 3600 })
        .withMessage('Rest duration must be between 0 and 3600 seconds'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .trim()
        .escape()
        .withMessage('Notes must be maximum 500 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(Object.values(client_1.ExerciseCategory))
        .withMessage('Invalid exercise category'),
    (0, express_validator_1.body)('useAI')
        .optional()
        .isBoolean()
        .withMessage('useAI must be a boolean'),
    // Cardio-specific field validations
    (0, express_validator_1.body)('distance')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Distance must be between 0 and 100 miles'),
    (0, express_validator_1.body)('laps')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Laps must be between 1 and 1000'),
    (0, express_validator_1.body)('heartRate')
        .optional()
        .isInt({ min: 60, max: 220 })
        .withMessage('Heart rate must be between 60 and 220 bpm'),
    (0, express_validator_1.body)('heartRateMax')
        .optional()
        .isInt({ min: 60, max: 220 })
        .withMessage('Maximum heart rate must be between 60 and 220 bpm'),
    (0, express_validator_1.body)('lapTime')
        .optional()
        .isInt({ min: 30, max: 3600 })
        .withMessage('Lap time must be between 30 and 3600 seconds'),
    (0, express_validator_1.body)('estimatedCalories')
        .optional()
        .isInt({ min: 1, max: 2000 })
        .withMessage('Estimated calories must be between 1 and 2000'),
    (0, express_validator_1.body)('perceivedEffort')
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('Perceived effort must be 1-50 characters'),
    (0, express_validator_1.body)('pace')
        .optional()
        .isString()
        .isLength({ min: 1, max: 20 })
        .trim()
        .withMessage('Pace must be 1-20 characters')
];
const validateWorkoutQuery = [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be non-negative'),
    (0, express_validator_1.query)('category')
        .optional()
        .isIn(Object.values(client_1.ExerciseCategory))
        .withMessage('Invalid exercise category'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be valid ISO8601 format'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be valid ISO8601 format'),
    (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be between 1 and 365')
];
const validateLogId = [
    (0, express_validator_1.param)('logId')
        .isUUID()
        .withMessage('Log ID must be a valid UUID')
];
const validateExerciseDetection = [
    (0, express_validator_1.body)('exerciseDescription')
        .isString()
        .isLength({ min: 1, max: 200 })
        .trim()
        .escape()
        .withMessage('Exercise description must be 1-200 characters')
];
const validateWorkoutLogUpdate = [
    (0, express_validator_1.body)('exerciseName')
        .optional()
        .isString()
        .isLength({ min: 1, max: 200 })
        .trim()
        .escape()
        .withMessage('Exercise name must be 1-200 characters'),
    (0, express_validator_1.body)('sets')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Sets must be between 1 and 50'),
    (0, express_validator_1.body)('reps')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Reps must be between 1 and 1000'),
    (0, express_validator_1.body)('weight')
        .optional()
        .isFloat({ min: 0, max: 2000 })
        .withMessage('Weight must be between 0 and 2000'),
    (0, express_validator_1.body)('duration')
        .optional()
        .isInt({ min: 0, max: 3600 })
        .withMessage('Duration must be between 0 and 3600 seconds'),
    (0, express_validator_1.body)('restDuration')
        .optional()
        .isInt({ min: 0, max: 3600 })
        .withMessage('Rest duration must be between 0 and 3600 seconds'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Notes must be maximum 500 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(Object.values(client_1.ExerciseCategory))
        .withMessage('Invalid exercise category'),
    // Cardio-specific field validations
    (0, express_validator_1.body)('distance')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Distance must be between 0 and 100 miles'),
    (0, express_validator_1.body)('laps')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Laps must be between 1 and 1000'),
    (0, express_validator_1.body)('heartRate')
        .optional()
        .isInt({ min: 60, max: 220 })
        .withMessage('Heart rate must be between 60 and 220 bpm'),
    (0, express_validator_1.body)('heartRateMax')
        .optional()
        .isInt({ min: 60, max: 220 })
        .withMessage('Maximum heart rate must be between 60 and 220 bpm'),
    (0, express_validator_1.body)('lapTime')
        .optional()
        .isInt({ min: 30, max: 3600 })
        .withMessage('Lap time must be between 30 and 3600 seconds'),
    (0, express_validator_1.body)('estimatedCalories')
        .optional()
        .isInt({ min: 1, max: 2000 })
        .withMessage('Estimated calories must be between 1 and 2000'),
    (0, express_validator_1.body)('perceivedEffort')
        .optional()
        .isString()
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('Perceived effort must be 1-50 characters'),
    (0, express_validator_1.body)('pace')
        .optional()
        .isString()
        .isLength({ min: 1, max: 20 })
        .trim()
        .withMessage('Pace must be 1-20 characters')
];
// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
// POST /api/workouts - Create a new workout log entry
router.post('/', (0, express_2.requireAuth)(), validateWorkoutLog, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Workout creation request received');
        console.log('User ID:', req.auth.userId);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        const userId = req.auth.userId;
        const _a = req.body, { useAI = true } = _a, workoutData = __rest(_a, ["useAI"]);
        console.log('Processed workout data:', JSON.stringify(workoutData, null, 2));
        console.log('Using AI:', useAI);
        const workoutLog = yield (0, workoutService_1.createWorkoutLog)(userId, workoutData, useAI);
        console.log('Workout log created successfully:', workoutLog.id);
        res.status(201).json({
            success: true,
            data: workoutLog
        });
    }
    catch (error) {
        console.error('Error creating workout log:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('validation') || error.message.includes('must be')) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }
            if (error.message.includes('Invalid user ID')) {
                return res.status(401).json({
                    error: 'Authentication error',
                    message: 'Invalid user authentication'
                });
            }
        }
        res.status(500).json({
            error: 'Failed to create workout log',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// GET /api/workouts - Get workout logs for the authenticated user
router.get('/', (0, express_2.requireAuth)(), validateWorkoutQuery, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const { limit = 5, // Changed default to 5 for recent logs
        offset = 0, category, startDate, endDate } = req.query;
        const result = yield (0, workoutService_1.getWorkoutLogs)(userId, parseInt(limit), parseInt(offset), category, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error('Error fetching workout logs:', error);
        res.status(500).json({
            error: 'Failed to fetch workout logs',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// GET /api/workouts/stats - Get workout statistics
router.get('/stats', (0, express_2.requireAuth)(), validateWorkoutQuery, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const { days = 30 } = req.query;
        const stats = yield (0, workoutService_1.getWorkoutStats)(userId, parseInt(days));
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching workout stats:', error);
        res.status(500).json({
            error: 'Failed to fetch workout stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// PUT /api/workouts/:logId - Update a workout log entry
router.put('/:logId', (0, express_2.requireAuth)(), validateLogId, validateWorkoutLogUpdate, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const { logId } = req.params;
        const updatedWorkout = yield (0, workoutService_1.updateWorkoutLog)(userId, logId, req.body);
        res.json({
            success: true,
            data: updatedWorkout
        });
    }
    catch (error) {
        console.error('Error updating workout log:', error);
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return res.status(404).json({
                    error: 'Workout not found',
                    message: error.message
                });
            }
            if (error.message.includes('must be') || error.message.includes('Invalid')) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }
        }
        res.status(500).json({
            error: 'Failed to update workout log',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// DELETE /api/workouts/:logId - Delete a workout log entry
router.delete('/:logId', (0, express_2.requireAuth)(), validateLogId, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.auth.userId;
        const { logId } = req.params;
        yield (0, workoutService_1.deleteWorkoutLog)(userId, logId);
        res.json({
            success: true,
            message: 'Workout log deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting workout log:', error);
        res.status(500).json({
            error: 'Failed to delete workout log',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// POST /api/workouts/detect-exercise - AI exercise detection endpoint
router.post('/detect-exercise', (0, express_2.requireAuth)(), aiRateLimit, validateExerciseDetection, handleValidationErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { exerciseDescription } = req.body;
        const detection = yield (0, exerciseDetectionService_1.detectExercise)(exerciseDescription);
        res.json({
            success: true,
            data: detection
        });
    }
    catch (error) {
        console.error('Error detecting exercise:', error);
        res.status(500).json({
            error: 'Failed to detect exercise',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// GET /api/workouts/categories - Get available exercise categories
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = Object.values(client_1.ExerciseCategory).map(category => ({
            value: category,
            label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')
        }));
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            error: 'Failed to fetch categories',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
exports.default = router;
