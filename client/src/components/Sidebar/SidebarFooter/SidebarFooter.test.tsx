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

// Mock CSS modules
vi.mock('./sidebar-footer.module.css', () => ({
  default: {
    sidebarFooter: 'sidebarFooter',
    footerButtons: 'footerButtons',
    authButton: 'authButton',
    copyright: 'copyright',
    closed: 'closed',
  },
}))

describe('SidebarFooter', () => {
  it('renders sign in and sign out buttons when sidebar is open or closed', () => {
    render(<SidebarFooter isOpen={true} />)
    
    expect(screen.getByTestId('signed-in')).toBeInTheDocument()
    expect(screen.getByTestId('signed-out')).toBeInTheDocument()
    expect(screen.getByTestId('signin-button')).toBeInTheDocument()
    expect(screen.getByTestId('signout-button')).toBeInTheDocument()
  })

  it('renders sign in and sign out buttons with text and copyright when sidebar is open', () => {
    render(<SidebarFooter isOpen={true} />)
    
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
    expect(screen.getByText('© 2025 Chalk')).toBeInTheDocument()
  })

  it('renders only icons when sidebar is closed', () => {
    render(<SidebarFooter isOpen={false} />)
    
    expect(screen.getByTestId('login-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
    // Should not show text when closed
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
  })

  it('does not render copyright when sidebar is closed', () => {
    render(<SidebarFooter isOpen={false} />)
    
    expect(screen.queryByText('© 2025 Chalk')).not.toBeInTheDocument()
  })

  it('renders different content based on isOpen prop', () => {
    const { rerender } = render(<SidebarFooter isOpen={true} />)
    
    // When open, should show text and copyright
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
    expect(screen.getByText('© 2025 Chalk')).toBeInTheDocument()
    
    // When closed, should show only icons
    rerender(<SidebarFooter isOpen={false} />)
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    expect(screen.queryByText('© 2025 Chalk')).not.toBeInTheDocument()
  })

  it('has correct structure with footer div', () => {
    const { container } = render(<SidebarFooter isOpen={true} />)
    
    const footerDiv = container.firstChild as HTMLElement
    expect(footerDiv).toHaveClass('sidebarFooter')
  })

  it('renders authentication components correctly', () => {
    render(<SidebarFooter isOpen={true} />)
    
    // Should have both SignedIn and SignedOut components
    expect(screen.getByTestId('signed-in')).toBeInTheDocument()
    expect(screen.getByTestId('signed-out')).toBeInTheDocument()
    
    // Each should contain their respective buttons
    const signedInContainer = screen.getByTestId('signed-in')
    const signedOutContainer = screen.getByTestId('signed-out')
    
    expect(signedInContainer).toContainElement(screen.getByTestId('signout-button'))
    expect(signedOutContainer).toContainElement(screen.getByTestId('signin-button'))
  })

  it('applies correct CSS classes based on open state', () => {
    const { container, rerender } = render(<SidebarFooter isOpen={true} />)
    
    // When open, footer buttons should not have closed class
    let footerButtons = container.querySelector('.footerButtons')
    expect(footerButtons).not.toHaveClass('closed')
    
    // When closed, footer buttons should have closed class
    rerender(<SidebarFooter isOpen={false} />)
    footerButtons = container.querySelector('.footerButtons')
    expect(footerButtons).toHaveClass('closed')
  })
})
