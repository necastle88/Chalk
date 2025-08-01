# Testing Setup Guide

This workspace has been configured with comprehensive testing setup for both client and server applications.

## Client Testing (React + Vite + Vitest)

### Dependencies Installed
- **vitest**: Fast testing framework that integrates well with Vite
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM environment for testing

### Configuration Files
- `vitest.config.ts`: Vitest configuration with React plugin, jsdom environment, and test setup
- `src/setupTests.ts`: Global test setup with Jest DOM matchers and basic mocks

### Available Scripts
```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI interface
npm run test:coverage # Run tests with coverage report
```

### Example Test Structure
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Component from './Component'

// Mock external dependencies
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: any }) => children,
  // ... other mocks
}))

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Current Test Files
- `src/components/Sidebar/SidebarFooter/sidebar-footer.test.tsx` - Example React component test
- `src/example.test.ts` - Basic test examples

## Server Testing (Node.js + Express + Jest)

### Dependencies Installed
- **jest**: JavaScript testing framework
- **@types/jest**: TypeScript types for Jest
- **ts-jest**: TypeScript preprocessor for Jest
- **supertest**: HTTP assertion library for testing Express apps
- **@types/supertest**: TypeScript types for Supertest

### Configuration Files
- `jest.config.json`: Jest configuration with TypeScript support
- `tests/setupTests.ts`: Global test setup with environment variables and mocks

### Available Scripts
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Example Test Structure
```typescript
import request from 'supertest'
import app from '../src/app' // Your Express app

describe('API Endpoints', () => {
  it('GET / should return success message', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)
    
    expect(response.text).toBe('Expected response')
  })
})
```

### Current Test Files
- `tests/server.test.ts` - Basic server API tests

## Testing Best Practices

### 1. Component Testing (Client)
- Test component behavior, not implementation details
- Use `data-testid` attributes for reliable element selection
- Mock external dependencies (APIs, authentication, etc.)
- Test user interactions with `@testing-library/user-event`

### 2. API Testing (Server)
- Test HTTP endpoints with different scenarios (success, error, edge cases)
- Mock external services and databases
- Test authentication and authorization
- Validate request/response formats

### 3. General Guidelines
- Write descriptive test names that explain what is being tested
- Use `describe` blocks to group related tests
- Set up test data in `beforeEach` hooks when needed
- Clean up after tests in `afterEach` hooks

## Mocking Common Dependencies

### Clerk Authentication (Client)
```typescript
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: any }) => children,
  SignedOut: ({ children }: { children: any }) => null,
  useUser: () => ({ isSignedIn: true, user: { id: 'test-user' } }),
}))
```

### Environment Variables (Server)
```typescript
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'test://localhost/test_db'
```

## Running Tests

### Client Tests
```bash
cd client
npm run test:run     # Single run
npm run test         # Watch mode
npm run test:coverage # With coverage
```

### Server Tests
```bash
cd server
npm test             # Single run
npm run test:watch   # Watch mode
npm run test:coverage # With coverage
```

## Coverage Reports
Both client and server are configured to generate coverage reports:
- Client: Coverage reports will be in `client/coverage/`
- Server: Coverage reports will be in `server/coverage/`

## Next Steps
1. Add more comprehensive tests for existing components
2. Set up database testing with test database
3. Add integration tests
4. Configure CI/CD pipeline to run tests automatically
5. Add E2E tests with Playwright or Cypress if needed

## Troubleshooting
- If tests fail due to missing mocks, check the `setupTests.ts` files
- For TypeScript errors, ensure proper types are imported
- For React component tests, make sure to import React when using JSX
- Check that all test files have proper extensions (`.test.ts` or `.test.tsx`)
