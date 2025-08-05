import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SidebarHeader from './SidebarHeader'

// Mock the ExpandSidebarButton component
vi.mock('../ExpandSidebarButton/ExpandSidebarButton', () => ({
  default: ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
    <button 
      data-testid="expand-button" 
      onClick={onClick}
      aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      {isOpen ? 'Collapse' : 'Expand'}
    </button>
  ),
}))

// Mock CSS modules
vi.mock('./sidebar-header.module.css', () => ({
  default: {
    sidebarHeader: 'sidebarHeader',
    closed: 'closed',
    logoContainer: 'logoContainer',
    logoImage: 'logoImage',
  },
}))

// Mock the logo image
vi.mock('../../../assets/ChalkLogoDM.png', () => ({
  default: 'mocked-logo-path.png',
}))

describe('SidebarHeader', () => {
  const mockToggleSidebar = vi.fn()

  beforeEach(() => {
    mockToggleSidebar.mockClear()
  })

  it('renders logo and description when sidebar is open', () => {
    render(<SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />)
    
    // Should show logo and description when open
    expect(screen.getByAltText('Chalk Logo')).toBeInTheDocument()
    expect(screen.getByText('Your fitness tracking app')).toBeInTheDocument()
    expect(screen.getByTestId('expand-button')).toBeInTheDocument()
  })

  it('shows only expand button when sidebar is closed', () => {
    render(<SidebarHeader isOpen={false} toggleSidebar={mockToggleSidebar} />)
    
    // Should only show expand button when closed
    expect(screen.queryByAltText('Chalk Logo')).not.toBeInTheDocument()
    expect(screen.queryByText('Your fitness tracking app')).not.toBeInTheDocument()
    expect(screen.getByTestId('expand-button')).toBeInTheDocument()
  })

  it('calls toggleSidebar when expand button is clicked', async () => {
    const user = userEvent.setup()
    render(<SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />)
    
    await user.click(screen.getByTestId('expand-button'))
    
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('passes correct isOpen prop to ExpandSidebarButton', () => {
    const { rerender } = render(<SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />)
    
    // When open, button should show "Collapse"
    expect(screen.getByText('Collapse')).toBeInTheDocument()
    
    // When closed, button should show "Expand"
    rerender(<SidebarHeader isOpen={false} toggleSidebar={mockToggleSidebar} />)
    expect(screen.getByText('Expand')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />)
    
    // Logo should have proper alt text
    const logo = screen.getByAltText('Chalk Logo')
    expect(logo).toBeInTheDocument()
    
    // Button should have proper aria-label
    const button = screen.getByLabelText('Collapse sidebar')
    expect(button).toBeInTheDocument()
  })

  it('renders logo with correct src attribute', () => {
    render(<SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />)
    
    const logo = screen.getByAltText('Chalk Logo')
    expect(logo).toHaveAttribute('src', 'mocked-logo-path.png')
  })

  it('applies correct CSS classes based on open state', () => {
    const { container, rerender } = render(
      <SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />
    )
    
    // When open, should not have closed class
    let headerDiv = container.firstChild as HTMLElement
    expect(headerDiv).toHaveClass('sidebarHeader')
    expect(headerDiv).not.toHaveClass('closed')
    
    // When closed, should have closed class
    rerender(<SidebarHeader isOpen={false} toggleSidebar={mockToggleSidebar} />)
    headerDiv = container.firstChild as HTMLElement
    expect(headerDiv).toHaveClass('sidebarHeader', 'closed')
  })

  it('maintains consistent expand button behavior in both states', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <SidebarHeader isOpen={true} toggleSidebar={mockToggleSidebar} />
    )
    
    // Click when open
    await user.click(screen.getByTestId('expand-button'))
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
    
    // Re-render as closed and click again
    rerender(<SidebarHeader isOpen={false} toggleSidebar={mockToggleSidebar} />)
    await user.click(screen.getByTestId('expand-button'))
    expect(mockToggleSidebar).toHaveBeenCalledTimes(2)
  })
})
