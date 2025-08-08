-- AlterTable
ALTER TABLE "public"."WorkoutLog" ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "estimatedCalories" INTEGER,
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "heartRateMax" INTEGER,
ADD COLUMN     "lapTime" INTEGER,
ADD COLUMN     "laps" INTEGER,
ADD COLUMN     "pace" TEXT,
ADD COLUMN     "perceivedEffort" TEXT;
