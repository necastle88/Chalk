# Chalk Fitness Dashboard

A modern fitness tracking application with AI-powered exercise detection, built with React, TypeScript, and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Development

```bash
# Install all dependencies for workspace
npm install

# Start both client and server in development mode
npm run dev

# Or start them individually
npm run dev:client  # Starts client on http://localhost:5175
npm run dev:server  # Starts server on http://localhost:4000
```

## 📦 Available Scripts

### Root Workspace Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both client and server concurrently |
| `npm run build` | Build both client and server for production |
| `npm test` | Run tests for both client and server |
| `npm run lint` | Lint both client and server |
| `npm run lint:fix` | Fix linting issues in both projects |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts |

### Client Scripts (`/client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run start` | Alias for dev |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run serve` | Alias for preview |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint TypeScript/React files |
| `npm run lint:fix` | Fix linting issues |
| `npm run type-check` | Check TypeScript types |
| `npm run format` | Format code with Prettier |
| `npm run clean` | Clean build artifacts |

### Server Scripts (`/server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-restart |
| `npm run start` | Start production server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:watch` | Watch and compile TypeScript |
| `npm run test` | Run tests |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint TypeScript files |
| `npm run lint:fix` | Fix linting issues |
| `npm run type-check` | Check TypeScript types |
| `npm run format` | Format code with Prettier |

### Database Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:reset` | Reset database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with initial data |

## 🏗️ Project Structure

```
chalk-fitness-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── layouts/       # Layout components
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── types/         # TypeScript types
│   ├── prisma/            # Database schema & migrations
│   └── package.json
└── package.json           # Root workspace config
```

## 🛠️ Development Tools

- **TypeScript**: Type-safe development
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Vitest**: Fast unit testing for client
- **Jest**: Testing framework for server
- **Prisma**: Type-safe database ORM
- **Clerk**: Authentication & user management

## 🔧 Configuration Files

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Vitest test configuration

## 📝 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

Run `npm run format` to format all code according to project standards.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests only
npm run test:client

# Run server tests only  
npm run test:server

# Run tests with coverage
npm run test:coverage
```

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
