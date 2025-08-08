"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Setup global test environment
beforeAll(() => {
    // Setup any global test configurations
});
afterAll(() => {
    // Cleanup after tests
});
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'test://localhost/test_db';
process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
process.env.CLERK_PUBLISHABLE_KEY = 'test_clerk_public';
process.env.OPENAI_API_KEY = 'test_openai_key';
