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
  "duration": null,
  "distance": null,
  "distanceUnit": null,
  "laps": null,
  "heartRate": null,
  "heartRateMax": null,
  "perceivedEffort": null,
  "lapTime": null,
  "estimatedCalories": null,
  "pace": null
}

Instructions:
- Extract standardized exercise name (e.g., "Bench Press", "Back Squat", "Barbell Curl", "Treadmill Run", "Outdoor Running", "Stationary Bike")
- Use proper capitalization and standardized naming (e.g., "Dumbbell Bench Press" not "db bench press")
- Classify into the correct muscle group category

STRENGTH TRAINING:
- If sets/reps/weight are mentioned, extract them as numbers
- Common formats: "3x10", "3 sets of 10", "4x8 @ 185", "225 lbs 5x5", "80kg 3x5"
- Weight conversion: ALWAYS convert kg to pounds (1kg = 2.2lbs)

CARDIO EXERCISES:
- If duration is mentioned (seconds, minutes), convert to seconds and set duration field
- Extract distance if mentioned (miles, km, meters) - convert to miles (1 km = 0.621371 miles)
- Extract laps if mentioned as a number
- Extract heart rate if mentioned (e.g., "158 bpm", "heart rate 140") 
- Extract perceived effort (e.g., "easy", "moderate", "hard", "very hard")
- Extract lap time if mentioned (e.g., "7 min lap", "8:30 per mile") - convert to seconds
- Calculate estimated calories using this formula for running/walking:
  * Calories = duration_minutes × body_weight_estimate × MET_value
  * Use 70kg (154 lbs) as default body weight
  * MET values: walking = 3.5, jogging = 7, running = 10, cycling = 8, swimming = 8
  * For pace-based estimation: slower pace = lower MET, faster = higher MET
- Calculate pace if distance and duration are both available (e.g., "7:30/mile")

PARSING EXAMPLES:
- "running 40 minutes 10 laps 1 mile heart rate 158 bpm effort easy lap time 7 min"
  → Running, 40min duration, 10 laps, 1 mile distance, 158 bpm heart rate, easy effort, 7min lap time
- "30 minute bike ride moderate intensity"
  → Stationary Bike, 30min duration, moderate effort
- "treadmill 5k in 25 minutes"
  → Treadmill Run, 25min duration, 3.1 miles distance

Time formats: "30 seconds", "1 minute", "7 min", "25 minutes"
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
            // Validate and sanitize cardio-specific fields
            if (result.distance !== undefined && result.distance !== null) {
                result.distance = Math.max(0.1, Math.min(100, Number(result.distance))) || undefined;
            }
            if (result.distanceUnit !== undefined && result.distanceUnit !== null) {
                if (!['miles', 'km'].includes(result.distanceUnit)) {
                    result.distanceUnit = 'miles'; // default to miles
                }
            }
            if (result.laps !== undefined && result.laps !== null) {
                result.laps = Math.max(1, Math.min(1000, Math.floor(Number(result.laps)))) || undefined;
            }
            if (result.heartRate !== undefined && result.heartRate !== null) {
                result.heartRate = Math.max(60, Math.min(220, Math.floor(Number(result.heartRate)))) || undefined;
            }
            if (result.heartRateMax !== undefined && result.heartRateMax !== null) {
                result.heartRateMax = Math.max(60, Math.min(220, Math.floor(Number(result.heartRateMax)))) || undefined;
            }
            if (result.lapTime !== undefined && result.lapTime !== null) {
                result.lapTime = Math.max(30, Math.min(3600, Math.floor(Number(result.lapTime)))) || undefined;
            }
            if (result.estimatedCalories !== undefined && result.estimatedCalories !== null) {
                result.estimatedCalories = Math.max(1, Math.min(2000, Math.floor(Number(result.estimatedCalories)))) || undefined;
            }
            // Sanitize perceived effort
            if (result.perceivedEffort && typeof result.perceivedEffort === 'string') {
                const validEfforts = ['very easy', 'easy', 'moderate', 'hard', 'very hard'];
                const effort = result.perceivedEffort.toLowerCase().trim();
                if (!validEfforts.includes(effort)) {
                    result.perceivedEffort = undefined;
                }
                else {
                    result.perceivedEffort = effort;
                }
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
