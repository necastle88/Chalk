import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'

// Mock child components
vi.mock('./SidebarHeader/SidebarHeader', () => ({
  default: ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => (
    <div data-testid="sidebar-header">
      <span>SidebarHeader - Open: {isOpen.toString()}</span>
      <button onClick={toggleSidebar} data-testid="toggle-button">Toggle</button>
    </div>
  ),
}))

vi.mock('./SidebarFooter/SidebarFooter', () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidebar-footer">
      SidebarFooter - Open: {isOpen.toString()}
    </div>
  ),
}))

// Mock CSS modules
vi.mock('./Sidebar.module.css', () => ({
  default: {
    sidebar: 'sidebar',
    closed: 'closed',
    sidebarContent: 'sidebarContent',
    sidebarLinks: 'sidebarLinks',
  },
}))

describe('Sidebar', () => {
  it('renders the sidebar component with default open state', () => {
    render(<Sidebar />)
    
    // Check if main elements are present
    expect(screen.getByRole('complementary')).toBeInTheDocument() // aside element
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
  })

  it('renders navigation links correctly', () => {
    render(<Sidebar />)
    
    // Check navigation links
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Workouts')).toBeInTheDocument()
    expect(screen.getByText('Nutrition')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
    
    // Check link hrefs
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Workouts' })).toHaveAttribute('href', '/workouts')
    expect(screen.getByRole('link', { name: 'Nutrition' })).toHaveAttribute('href', '/nutrition')
    expect(screen.getByRole('link', { name: 'Progress' })).toHaveAttribute('href', '/progress')
  })

  it('starts with sidebar open by default', () => {
    render(<Sidebar />)
    
    // Check that components receive isOpen as true
    expect(screen.getByText('SidebarHeader - Open: true')).toBeInTheDocument()
    expect(screen.getByText('SidebarFooter - Open: true')).toBeInTheDocument()
  })

  it('toggles sidebar state when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    
    // Initially open
    expect(screen.getByText('SidebarHeader - Open: true')).toBeInTheDocument()
    expect(screen.getByText('SidebarFooter - Open: true')).toBeInTheDocument()
    
    // Click toggle button
    await user.click(screen.getByTestId('toggle-button'))
    
    // Should be closed now
    expect(screen.getByText('SidebarHeader - Open: false')).toBeInTheDocument()
    expect(screen.getByText('SidebarFooter - Open: false')).toBeInTheDocument()
    
    // Click again to open
    await user.click(screen.getByTestId('toggle-button'))
    
    // Should be open again
    expect(screen.getByText('SidebarHeader - Open: true')).toBeInTheDocument()
    expect(screen.getByText('SidebarFooter - Open: true')).toBeInTheDocument()
  })

  it('applies correct CSS classes based on open state', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)
    
    const sidebar = screen.getByRole('complementary')
    
    // Initially open (should not have closed class)
    expect(sidebar).toHaveClass('sidebar')
    expect(sidebar).not.toHaveClass('closed')
    
    // Toggle to closed
    await user.click(screen.getByTestId('toggle-button'))
    
    // Should have both sidebar and closed classes
    expect(sidebar).toHaveClass('sidebar', 'closed')
  })

  it('renders correct number of navigation items', () => {
    render(<Sidebar />)
    
    const navItems = screen.getAllByRole('listitem')
    expect(navItems).toHaveLength(4)
  })

  it('has proper semantic structure', () => {
    render(<Sidebar />)
    
    // Should have proper semantic elements
    expect(screen.getByRole('complementary')).toBeInTheDocument() // aside
    expect(screen.getByRole('navigation')).toBeInTheDocument() // nav
    expect(screen.getByRole('list')).toBeInTheDocument() // ul
    expect(screen.getAllByRole('listitem')).toHaveLength(4) // li elements
    expect(screen.getAllByRole('link')).toHaveLength(4) // a elements
  })

  it('passes correct props to child components', () => {
    render(<Sidebar />)
    
    // Both header and footer should receive isOpen prop
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    
    // Check that the toggle function is passed to header
    expect(screen.getByTestId('toggle-button')).toBeInTheDocument()
  })
})
