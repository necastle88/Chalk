import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SidebarFooter from './SidebarFooter'

// Mock Clerk components
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: any }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: any }) => <div data-testid="signed-out">{children}</div>,
  SignInButton: ({ children }: { children: any }) => <div data-testid="signin-button">{children}</div>,
  SignOutButton: ({ children }: { children: any }) => <div data-testid="signout-button">{children}</div>,
}))

// Mock Material-UI icons
vi.mock('@mui/icons-material/Logout', () => ({
  default: () => <span data-testid="logout-icon">Logout</span>,
}))

vi.mock('@mui/icons-material/Login', () => ({
  default: () => <span data-testid="login-icon">Login</span>,
}))

describe('SidebarFooter', () => {
  it('renders sign in and sign out buttons when sidebar is open', () => {
    render(<SidebarFooter isOpen={true} />)
    
    expect(screen.getByTestId('signed-in')).toBeInTheDocument()
    expect(screen.getByTestId('signed-out')).toBeInTheDocument()
    expect(screen.getByTestId('signin-button')).toBeInTheDocument()
    expect(screen.getByTestId('signout-button')).toBeInTheDocument()
  })

  it('renders sign in and sign out buttons with text when sidebar is closed', () => {
    render(<SidebarFooter isOpen={false} />)
    
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
    expect(screen.getByText('© 2025 Chalk')).toBeInTheDocument()
  })

  it('renders icons when sidebar is open', () => {
    render(<SidebarFooter isOpen={true} />)
    
    expect(screen.getByTestId('login-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })

  it('does not render copyright when sidebar is open', () => {
    render(<SidebarFooter isOpen={true} />)
    
    expect(screen.queryByText('© 2025 Chalk')).not.toBeInTheDocument()
  })
})