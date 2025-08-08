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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkoutLog = createWorkoutLog;
exports.getWorkoutLogs = getWorkoutLogs;
exports.getWorkoutStats = getWorkoutStats;
exports.deleteWorkoutLog = deleteWorkoutLog;
const client_1 = require("@prisma/client");
const exerciseDetectionService_1 = require("./exerciseDetectionService");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const prisma = new client_1.PrismaClient();
// OWASP Security: Input validation and sanitization
function validateWorkoutLogInput(data) {
    // Validate required fields
    if (!data.exerciseDescription || typeof data.exerciseDescription !== 'string') {
        throw new Error('Exercise description is required and must be a string');
    }
    if (typeof data.sets !== 'number' || data.sets < 1 || data.sets > 50) {
        throw new Error('Sets must be a number between 1 and 50');
    }
    if (typeof data.reps !== 'number' || data.reps < 1 || data.reps > 1000) {
        throw new Error('Reps must be a number between 1 and 1000');
    }
    if (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 2000) {
        throw new Error('Weight must be a number between 0 and 2000');
    }
    // Optional field validations
    if (data.duration !== undefined) {
        if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > 3600) {
            throw new Error('Duration must be a number between 0 and 3600 seconds');
        }
    }
    if (data.restDuration !== undefined) {
        if (typeof data.restDuration !== 'number' || data.restDuration < 0 || data.restDuration > 3600) {
            throw new Error('Rest duration must be a number between 0 and 3600 seconds');
        }
    }
    if (data.notes !== undefined) {
        if (typeof data.notes !== 'string' || data.notes.length > 500) {
            throw new Error('Notes must be a string with maximum 500 characters');
        }
    }
    if (data.category !== undefined) {
        if (!Object.values(client_1.ExerciseCategory).includes(data.category)) {
            throw new Error('Invalid exercise category');
        }
    }
}
function sanitizeWorkoutLogData(data) {
    return {
        exerciseDescription: (0, exerciseDetectionService_1.sanitizeExerciseInput)(data.exerciseDescription),
        sets: Math.floor(Math.abs(data.sets)),
        reps: Math.floor(Math.abs(data.reps)),
        weight: Math.abs(data.weight),
        duration: data.duration ? Math.floor(Math.abs(data.duration)) : undefined,
        restDuration: data.restDuration ? Math.floor(Math.abs(data.restDuration)) : undefined,
        notes: data.notes ? (0, sanitize_html_1.default)(data.notes.trim(), {
            allowedTags: [],
            allowedAttributes: {}
        }).slice(0, 500) : undefined,
        category: data.category
    };
}
function createWorkoutLog(userId_1, data_1) {
    return __awaiter(this, arguments, void 0, function* (userId, data, useAI = true) {
        try {
            // OWASP Security: Validate user ID format
            if (!userId || typeof userId !== 'string' || userId.length < 10) {
                throw new Error('Invalid user ID');
            }
            // Validate and sanitize input
            validateWorkoutLogInput(data);
            const sanitizedData = sanitizeWorkoutLogData(data);
            let exerciseName;
            let category;
            let aiConfidence;
            // Use provided category or detect with AI
            if (sanitizedData.category) {
                exerciseName = sanitizedData.exerciseDescription;
                category = sanitizedData.category;
            }
            else if (useAI) {
                try {
                    const detection = yield (0, exerciseDetectionService_1.detectExercise)(sanitizedData.exerciseDescription);
                    exerciseName = detection.exerciseName;
                    category = detection.category;
                    aiConfidence = detection.confidence;
                }
                catch (aiError) {
                    console.warn('AI detection failed, using offline fallback:', aiError);
                    const fallback = (0, exerciseDetectionService_1.getOfflineExerciseDetection)(sanitizedData.exerciseDescription);
                    exerciseName = fallback.exerciseName;
                    category = fallback.category;
                    aiConfidence = fallback.confidence;
                }
            }
            else {
                const fallback = (0, exerciseDetectionService_1.getOfflineExerciseDetection)(sanitizedData.exerciseDescription);
                exerciseName = fallback.exerciseName;
                category = fallback.category;
            }
            // Create or get exercise record
            let exercise = yield prisma.exercise.findFirst({
                where: { name: exerciseName }
            });
            if (!exercise) {
                exercise = yield prisma.exercise.create({
                    data: {
                        name: exerciseName,
                        category: category,
                        description: `Auto-created from user input: ${sanitizedData.exerciseDescription}`
                    }
                });
            }
            // Create workout log entry
            const workoutLog = yield prisma.workoutLog.create({
                data: {
                    userId,
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    category: category,
                    sets: sanitizedData.sets,
                    reps: sanitizedData.reps,
                    weight: sanitizedData.weight,
                    // duration: sanitizedData.duration, // TODO: Enable after Prisma client regeneration
                    restDuration: sanitizedData.restDuration,
                    notes: sanitizedData.notes
                }
            });
            return {
                id: workoutLog.id,
                exerciseName: workoutLog.exerciseName,
                category: workoutLog.category,
                sets: workoutLog.sets,
                reps: workoutLog.reps,
                weight: workoutLog.weight,
                // duration: workoutLog.duration || undefined, // TODO: Enable after Prisma client regeneration
                restDuration: workoutLog.restDuration || undefined,
                notes: workoutLog.notes || undefined,
                date: workoutLog.date,
                aiConfidence
            };
        }
        catch (error) {
            console.error('Error creating workout log:', error);
            throw error;
        }
    });
}
function getWorkoutLogs(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, limit = 50, offset = 0, category, startDate, endDate) {
        try {
            // OWASP Security: Validate input parameters
            if (!userId || typeof userId !== 'string') {
                throw new Error('Invalid user ID');
            }
            if (limit < 1 || limit > 100) {
                throw new Error('Limit must be between 1 and 100');
            }
            if (offset < 0) {
                throw new Error('Offset must be non-negative');
            }
            const whereClause = { userId };
            if (category && Object.values(client_1.ExerciseCategory).includes(category)) {
                whereClause.category = category;
            }
            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate)
                    whereClause.date.gte = startDate;
                if (endDate)
                    whereClause.date.lte = endDate;
            }
            // Get total count for pagination
            const totalCount = yield prisma.workoutLog.count({
                where: whereClause
            });
            const workoutLogs = yield prisma.workoutLog.findMany({
                where: whereClause,
                orderBy: { date: 'desc' },
                take: limit,
                skip: offset
            });
            const data = workoutLogs.map(log => ({
                id: log.id,
                exerciseName: log.exerciseName,
                category: log.category,
                sets: log.sets,
                reps: log.reps,
                weight: log.weight,
                // duration: log.duration || undefined, // TODO: Enable after Prisma client regeneration
                restDuration: log.restDuration || undefined,
                notes: log.notes || undefined,
                date: log.date
            }));
            return {
                data,
                pagination: {
                    limit,
                    offset,
                    total: totalCount,
                    hasMore: offset + limit < totalCount
                }
            };
        }
        catch (error) {
            console.error('Error fetching workout logs:', error);
            throw error;
        }
    });
}
function getWorkoutStats(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, days = 30) {
        try {
            if (!userId || typeof userId !== 'string') {
                throw new Error('Invalid user ID');
            }
            if (days < 1 || days > 365) {
                throw new Error('Days must be between 1 and 365');
            }
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const stats = yield prisma.workoutLog.groupBy({
                by: ['category'],
                where: {
                    userId,
                    date: { gte: startDate }
                },
                _count: {
                    id: true
                },
                _sum: {
                    sets: true,
                    reps: true
                },
                _avg: {
                    weight: true
                }
            });
            return stats.map(stat => ({
                category: stat.category,
                totalWorkouts: stat._count.id,
                totalSets: stat._sum.sets || 0,
                totalReps: stat._sum.reps || 0,
                averageWeight: stat._avg.weight ? Math.round(stat._avg.weight * 100) / 100 : 0
            }));
        }
        catch (error) {
            console.error('Error fetching workout stats:', error);
            throw error;
        }
    });
}
function deleteWorkoutLog(userId, logId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!userId || !logId) {
                throw new Error('User ID and log ID are required');
            }
            // Verify ownership before deletion
            const log = yield prisma.workoutLog.findFirst({
                where: { id: logId, userId }
            });
            if (!log) {
                throw new Error('Workout log not found or access denied');
            }
            yield prisma.workoutLog.delete({
                where: { id: logId }
            });
        }
        catch (error) {
            console.error('Error deleting workout log:', error);
            throw error;
        }
    });
}
