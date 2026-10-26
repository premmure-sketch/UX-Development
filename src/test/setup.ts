import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock matchMedia for MUI and theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock ResponsiveContainer for jsdom without jsx in .ts
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts')
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'div',
        {
          style: { width: 800, height: 400 },
          'data-testid': 'recharts-container',
        },
        children
      ),
  }
})
