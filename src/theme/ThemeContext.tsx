import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import type { ThemeMode } from '../types'
import { getAppTheme } from './theme'

interface ThemeContextType {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('pulse_workforce_theme')
      if (saved === 'light' || saved === 'dark') return saved
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return 'light'
  })

  useEffect(() => {
    try {
      localStorage.setItem('pulse_workforce_theme', mode)
    } catch {
      // Ignore
    }
    document.documentElement.setAttribute('data-theme', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(() => getAppTheme(mode), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme: setMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
