import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('hello world').toContain('world')
  })
})
