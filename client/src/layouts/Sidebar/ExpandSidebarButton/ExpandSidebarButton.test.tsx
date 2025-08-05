import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpandSidebarButton from './ExpandSidebarButton'

// Mock CSS modules
vi.mock('./expand-sidebar-button.module.css', () => ({
  default: {
    expandButton: 'expandButton',
    chevronContainer: 'chevronContainer',
    biggerChevron: 'biggerChevron',
    smallerChevron: 'smallerChevron',
    line: 'line',
    open: 'open',
    closed: 'closed',
  },
}))

describe('ExpandSidebarButton', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders the button component', () => {
    render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    // Should render a clickable div
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('calls onClick function when clicked', async () => {
    const user = userEvent.setup()
    render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct CSS classes when sidebar is open', () => {
    const { container } = render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const buttonDiv = container.firstChild as HTMLElement
    expect(buttonDiv).toHaveClass('chevronContainer', 'expandButton', 'closed')
    
    // Check chevron divs
    const biggerChevron = buttonDiv.children[0] as HTMLElement
    const smallerChevron = buttonDiv.children[1] as HTMLElement
    expect(biggerChevron).toHaveClass('biggerChevron', 'closed')
    expect(smallerChevron).toHaveClass('smallerChevron', 'closed')
  })

  it('applies correct CSS classes when sidebar is closed', () => {
    const { container } = render(<ExpandSidebarButton isOpen={false} onClick={mockOnClick} />)
    
    const buttonDiv = container.firstChild as HTMLElement
    expect(buttonDiv).toHaveClass('chevronContainer', 'expandButton', 'open')
    
    // Check chevron divs
    const biggerChevron = buttonDiv.children[0] as HTMLElement
    const smallerChevron = buttonDiv.children[1] as HTMLElement
    expect(biggerChevron).toHaveClass('biggerChevron', 'open')
    expect(smallerChevron).toHaveClass('smallerChevron', 'open')
  })

  it('changes CSS classes when isOpen prop changes', () => {
    const { container, rerender } = render(
      <ExpandSidebarButton isOpen={true} onClick={mockOnClick} />
    )
    
    // Initially open (should have closed classes)
    let buttonDiv = container.firstChild as HTMLElement
    let biggerChevron = buttonDiv.children[0] as HTMLElement
    expect(buttonDiv).toHaveClass('closed')
    expect(biggerChevron).toHaveClass('closed')
    
    // Change to closed (should have open classes)
    rerender(<ExpandSidebarButton isOpen={false} onClick={mockOnClick} />)
    buttonDiv = container.firstChild as HTMLElement
    biggerChevron = buttonDiv.children[0] as HTMLElement
    expect(buttonDiv).toHaveClass('open')
    expect(biggerChevron).toHaveClass('open')
  })

  it('renders chevron elements with line divs', () => {
    const { container } = render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const buttonDiv = container.firstChild as HTMLElement
    const biggerChevron = buttonDiv.children[0] as HTMLElement
    const smallerChevron = buttonDiv.children[1] as HTMLElement
    
    // Each chevron should have 2 line divs
    expect(biggerChevron.children).toHaveLength(2)
    expect(smallerChevron.children).toHaveLength(2)
    
    // Check that all line divs have the correct class
    Array.from(biggerChevron.children).forEach(child => {
      expect(child).toHaveClass('line')
    })
    Array.from(smallerChevron.children).forEach(child => {
      expect(child).toHaveClass('line')
    })
  })

  it('maintains consistent behavior across multiple clicks', async () => {
    const user = userEvent.setup()
    render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    
    // Click multiple times
    await user.click(button)
    await user.click(button)
    await user.click(button)
    
    expect(mockOnClick).toHaveBeenCalledTimes(3)
  })

  it('has proper structure with chevron elements', () => {
    const { container } = render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const buttonDiv = container.firstChild as HTMLElement
    
    // Should have exactly 2 chevron divs
    expect(buttonDiv.children).toHaveLength(2)
    
    // Should be clickable and accessible
    expect(buttonDiv).toHaveAttribute('role', 'button')
    expect(buttonDiv).toHaveAttribute('tabIndex', '0')
  })

  it('is accessible via keyboard', async () => {
    const user = userEvent.setup()
    render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    
    // Should be focusable
    await user.tab()
    expect(button).toHaveFocus()
    
    // Should be activatable with Enter
    await user.keyboard('{Enter}')
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    
    mockOnClick.mockClear()
    
    // Should also work with space
    await user.keyboard(' ')
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('has correct aria-label based on state', () => {
    const { rerender } = render(<ExpandSidebarButton isOpen={true} onClick={mockOnClick} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Collapse sidebar')
    
    rerender(<ExpandSidebarButton isOpen={false} onClick={mockOnClick} />)
    expect(button).toHaveAttribute('aria-label', 'Expand sidebar')
  })
})
