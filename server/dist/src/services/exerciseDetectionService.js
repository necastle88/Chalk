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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonExercises = void 0;
exports.sanitizeExerciseInput = sanitizeExerciseInput;
exports.detectExercise = detectExercise;
exports.getOfflineExerciseDetection = getOfflineExerciseDetection;
const openai_1 = require("openai");
const client_1 = require("@prisma/client");
// OWASP Security: Environment variable validation
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
}
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Exercise category mappings for AI guidance
const categoryDescriptions = {
    CHEST: 'chest, pectorals, bench press, push-ups, dips, flies',
    BACK: 'back, lats, rhomboids, pull-ups, rows, deadlifts, lat pulldowns',
    LEGS: 'legs, quadriceps, hamstrings, glutes, squats, lunges, leg press, calf raises',
    ARMS: 'arms, biceps, triceps, forearms, curls, extensions, hammer curls',
    SHOULDERS: 'shoulders, deltoids, overhead press, lateral raises, shrugs',
    CORE: 'core, abs, obliques, planks, crunches, leg raises, russian twists',
    CARDIO: 'cardio, running, cycling, treadmill, elliptical, rowing, walking',
    FULLBODY: 'full body, compound movements, burpees, mountain climbers, thrusters',
    OTHER: 'other exercises not clearly fitting other categories'
};
// Muscle group mappings for human-readable display
const muscleGroupNames = {
    CHEST: 'Chest',
    BACK: 'Back',
    LEGS: 'Legs',
    ARMS: 'Arms',
    SHOULDERS: 'Shoulders',
    CORE: 'Core',
    CARDIO: 'Cardio',
    FULLBODY: 'Full Body',
    OTHER: 'Other'
};
function getMuscleGroupName(category) {
    return muscleGroupNames[category] || 'Other';
}
// OWASP Security: Input sanitization and validation
function sanitizeExerciseInput(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid exercise input');
    }
    // Remove potentially dangerous characters but keep exercise-related punctuation
    const sanitized = input
        .trim()
        .slice(0, 200) // Limit length to prevent abuse
        .replace(/[<>\"']/g, '') // Remove HTML/script injection attempts
        .replace(/\s+/g, ' '); // Normalize whitespace
    if (sanitized.length === 0) {
        throw new Error('Exercise input cannot be empty after sanitization');
    }
    return sanitized;
}
function detectExercise(input) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const sanitizedInput = sanitizeExerciseInput(input);
            // OWASP Security: Rate limiting should be handled at route level
            // Additional validation for prompt injection prevention
            if (sanitizedInput.toLowerCase().includes('ignore') ||
                sanitizedInput.toLowerCase().includes('forget') ||
                sanitizedInput.toLowerCase().includes('system')) {
                throw new Error('Invalid exercise description');
            }
            const prompt = `You are an exercise classification and parsing expert. Analyze the following exercise description and extract the exercise name, category, and workout details. Return ONLY a JSON object with the exact format:

{
  "exerciseName": "standardized exercise name",
  "category": "CATEGORY_FROM_LIST",
  "confidence": 0.95,
  "suggestions": ["alternative name 1", "alternative name 2"],
  "sets": null,
  "reps": null,
  "weight": null,
  "duration": null
}

Instructions:
- Extract standardized exercise name (e.g., "Bench Press", "Back Squat", "Barbell Curl", "Treadmill Run")
- Use proper capitalization and standardized naming (e.g., "Dumbbell Bench Press" not "db bench press")
- Classify into the correct muscle group category
- If sets/reps/weight are mentioned, extract them as numbers
- If duration is mentioned (seconds, minutes), convert to seconds and set duration field
- Common formats: "3x10", "3 sets of 10", "4x8 @ 185", "225 lbs 5x5", "80kg 3x5"
- Time formats: "30 seconds", "1 minute", "1 set of 30 seconds", "2 sets of 45 seconds each"
- Weight conversion: ALWAYS convert kg to pounds (1kg = 2.2lbs). Examples:
  * "80kg" = 176 lbs
  * "100kg bench press" = 220 lbs
  * "60kg 3x8" = 132 lbs
  * If both kg and lbs mentioned, prioritize the kg value and convert
- Duration should be in seconds (convert minutes: 1 minute = 60 seconds)
- For time-based exercises, often reps will be 1 and duration will be the time
- If no sets/reps/weight/duration mentioned, set them to null
- Be confident about exercise names and muscle groups, less confident about partial info
- Standardize common exercise variations:
  * "bench" or "bp" → "Bench Press"
  * "squat" → "Back Squat"
  * "dead" or "deadlift" → "Deadlift"
  * "pullup" or "pull up" → "Pull-up"
  * "pushup" or "push up" → "Push-up"

Valid categories: ${Object.keys(categoryDescriptions).join(', ')}

Category descriptions (muscle groups):
${Object.entries(categoryDescriptions).map(([cat, desc]) => `${cat}: ${desc}`).join('\n')}

Exercise description: "${sanitizedInput}"

Return ONLY the JSON object, no other text.`;
            const response = yield openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.1, // Low temperature for consistent results
                response_format: { type: 'json_object' }
            });
            const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!content) {
                throw new Error('No response from AI service');
            }
            // Parse and validate the AI response
            const result = JSON.parse(content);
            // Validate the response structure and content
            if (!result.exerciseName || !result.category || typeof result.confidence !== 'number') {
                throw new Error('Invalid AI response format');
            }
            // Validate category is from our enum
            if (!Object.values(client_1.ExerciseCategory).includes(result.category)) {
                result.category = client_1.ExerciseCategory.OTHER;
            }
            // Ensure confidence is within valid range
            result.confidence = Math.max(0, Math.min(1, result.confidence));
            // Sanitize suggestions if present
            if (result.suggestions) {
                result.suggestions = result.suggestions
                    .filter(s => typeof s === 'string' && s.length > 0)
                    .map(s => sanitizeExerciseInput(s))
                    .slice(0, 5); // Limit to 5 suggestions
            }
            // Sanitize exercise name
            result.exerciseName = sanitizeExerciseInput(result.exerciseName);
            // Add muscle group name
            result.muscleGroup = getMuscleGroupName(result.category);
            // Validate and sanitize numerical values
            if (result.sets !== undefined && result.sets !== null) {
                result.sets = Math.max(1, Math.min(50, Math.floor(Number(result.sets)))) || undefined;
            }
            if (result.reps !== undefined && result.reps !== null) {
                result.reps = Math.max(1, Math.min(1000, Math.floor(Number(result.reps)))) || undefined;
            }
            if (result.weight !== undefined && result.weight !== null) {
                result.weight = Math.max(0, Math.min(2000, Number(result.weight))) || undefined;
            }
            if (result.duration !== undefined && result.duration !== null) {
                result.duration = Math.max(1, Math.min(3600, Math.floor(Number(result.duration)))) || undefined;
            }
            return result;
        }
        catch (error) {
            console.error('Exercise detection error:', error);
            // Fallback: Return a safe default
            return {
                exerciseName: sanitizeExerciseInput(input),
                category: client_1.ExerciseCategory.OTHER,
                muscleGroup: getMuscleGroupName(client_1.ExerciseCategory.OTHER),
                confidence: 0.1,
                suggestions: []
            };
        }
    });
}
// Pre-defined common exercises for offline fallback
exports.commonExercises = {
    'bench press': client_1.ExerciseCategory.CHEST,
    'squat': client_1.ExerciseCategory.LEGS,
    'deadlift': client_1.ExerciseCategory.BACK,
    'pull up': client_1.ExerciseCategory.BACK,
    'push up': client_1.ExerciseCategory.CHEST,
    'bicep curl': client_1.ExerciseCategory.ARMS,
    'overhead press': client_1.ExerciseCategory.SHOULDERS,
    'plank': client_1.ExerciseCategory.CORE,
    'running': client_1.ExerciseCategory.CARDIO,
    'leg press': client_1.ExerciseCategory.LEGS,
    'lat pulldown': client_1.ExerciseCategory.BACK,
    'shoulder press': client_1.ExerciseCategory.SHOULDERS,
    'tricep extension': client_1.ExerciseCategory.ARMS,
    'leg curl': client_1.ExerciseCategory.LEGS,
    'calf raise': client_1.ExerciseCategory.LEGS
};
function getOfflineExerciseDetection(input) {
    const sanitizedInput = sanitizeExerciseInput(input).toLowerCase();
    // Check for exact matches first
    for (const [exercise, category] of Object.entries(exports.commonExercises)) {
        if (sanitizedInput.includes(exercise)) {
            return {
                exerciseName: exercise.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                category,
                muscleGroup: getMuscleGroupName(category),
                confidence: 0.8,
                suggestions: []
            };
        }
    }
    // Default fallback
    return {
        exerciseName: sanitizeExerciseInput(input),
        category: client_1.ExerciseCategory.OTHER,
        muscleGroup: getMuscleGroupName(client_1.ExerciseCategory.OTHER),
        confidence: 0.1,
        suggestions: []
    };
}
