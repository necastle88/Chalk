import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { requireAuth } from '@clerk/express';
import { 
  createWorkoutLog, 
  getWorkoutLogs, 
  getWorkoutStats, 
  deleteWorkoutLog 
} from '../services/workoutService';
import { detectExercise } from '../services/exerciseDetectionService';
import { ExerciseCategory } from '@prisma/client';

const router = express.Router();

// OWASP Security: Rate limiting
const workoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many workout requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const aiRateLimit = rateLimit({
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
  body('exerciseDescription')
    .isString()
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape()
    .withMessage('Exercise description must be 1-200 characters'),
  body('sets')
    .isInt({ min: 1, max: 50 })
    .withMessage('Sets must be between 1 and 50'),
  body('reps')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Reps must be between 1 and 1000'),
  body('weight')
    .isFloat({ min: 0, max: 2000 })
    .withMessage('Weight must be between 0 and 2000'),
  body('duration')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('Duration must be between 0 and 3600 seconds'),
  body('restDuration')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('Rest duration must be between 0 and 3600 seconds'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .trim()
    .escape()
    .withMessage('Notes must be maximum 500 characters'),
  body('category')
    .optional()
    .isIn(Object.values(ExerciseCategory))
    .withMessage('Invalid exercise category'),
  body('useAI')
    .optional()
    .isBoolean()
    .withMessage('useAI must be a boolean')
];

const validateWorkoutQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  query('category')
    .optional()
    .isIn(Object.values(ExerciseCategory))
    .withMessage('Invalid exercise category'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be valid ISO8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be valid ISO8601 format'),
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

const validateLogId = [
  param('logId')
    .isUUID()
    .withMessage('Log ID must be a valid UUID')
];

const validateExerciseDetection = [
  body('exerciseDescription')
    .isString()
    .isLength({ min: 1, max: 200 })
    .trim()
    .escape()
    .withMessage('Exercise description must be 1-200 characters')
];

// Validation error handler
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// POST /api/workouts - Create a new workout log entry
router.post('/', 
  requireAuth(),
  validateWorkoutLog,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      console.log('Workout creation request received');
      console.log('User ID:', req.auth.userId);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const userId = req.auth.userId;
      const { useAI = true, ...workoutData } = req.body;

      console.log('Processed workout data:', JSON.stringify(workoutData, null, 2));
      console.log('Using AI:', useAI);

      const workoutLog = await createWorkoutLog(userId, workoutData, useAI);

      console.log('Workout log created successfully:', workoutLog.id);

      res.status(201).json({
        success: true,
        data: workoutLog
      });
    } catch (error) {
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
  }
);

// GET /api/workouts - Get workout logs for the authenticated user
router.get('/',
  requireAuth(),
  validateWorkoutQuery,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.auth.userId;
      const {
        limit = 5, // Changed default to 5 for recent logs
        offset = 0,
        category,
        startDate,
        endDate
      } = req.query;

      const result = await getWorkoutLogs(
        userId,
        parseInt(limit as string),
        parseInt(offset as string),
        category as ExerciseCategory,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      res.status(500).json({
        error: 'Failed to fetch workout logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/workouts/stats - Get workout statistics
router.get('/stats',
  requireAuth(),
  validateWorkoutQuery,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.auth.userId;
      const { days = 30 } = req.query;

      const stats = await getWorkoutStats(userId, parseInt(days as string));

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
      res.status(500).json({
        error: 'Failed to fetch workout stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// DELETE /api/workouts/:logId - Delete a workout log entry
router.delete('/:logId',
  requireAuth(),
  validateLogId,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.auth.userId;
      const { logId } = req.params;

      await deleteWorkoutLog(userId, logId);

      res.json({
        success: true,
        message: 'Workout log deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workout log:', error);
      res.status(500).json({
        error: 'Failed to delete workout log',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// POST /api/workouts/detect-exercise - AI exercise detection endpoint
router.post('/detect-exercise',
  requireAuth(),
  aiRateLimit,
  validateExerciseDetection,
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { exerciseDescription } = req.body;

      const detection = await detectExercise(exerciseDescription);

      res.json({
        success: true,
        data: detection
      });
    } catch (error) {
      console.error('Error detecting exercise:', error);
      res.status(500).json({
        error: 'Failed to detect exercise',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET /api/workouts/categories - Get available exercise categories
router.get('/categories',
  async (req: express.Request, res: express.Response) => {
    try {
      const categories = Object.values(ExerciseCategory).map(category => ({
        value: category,
        label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')
      }));

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
