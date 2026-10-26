import { createTheme, responsiveFontSizes, type Theme } from '@mui/material/styles'
import type { ThemeMode } from '../types'

export const getAppTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark'

  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#818cf8' : '#4f46e5',
        light: isDark ? '#a5b4fc' : '#6366f1',
        dark: isDark ? '#4f46e5' : '#3730a3',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#22d3ee' : '#0891b2',
        light: isDark ? '#67e8f9' : '#06b6d4',
        dark: isDark ? '#0891b2' : '#0e7490',
        contrastText: '#ffffff',
      },
      success: {
        main: isDark ? '#34d399' : '#10b981',
        light: isDark ? '#6ee7b7' : '#34d399',
        dark: isDark ? '#059669' : '#047857',
        contrastText: '#ffffff',
      },
      warning: {
        main: isDark ? '#fbbf24' : '#f59e0b',
        light: isDark ? '#fcd34d' : '#fbbf24',
        dark: isDark ? '#d97706' : '#b45309',
        contrastText: '#1e293b',
      },
      error: {
        main: isDark ? '#f87171' : '#ef4444',
        light: isDark ? '#fca5a5' : '#f87171',
        dark: isDark ? '#dc2626' : '#b91c1c',
        contrastText: '#ffffff',
      },
      info: {
        main: isDark ? '#38bdf8' : '#0284c7',
        light: isDark ? '#7dd3fc' : '#38bdf8',
        dark: isDark ? '#0284c7' : '#0369a1',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
        disabled: isDark ? '#475569' : '#94a3b8',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: [
        'Plus Jakarta Sans',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 500, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.84375rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
      caption: { fontSize: '0.75rem', fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#334155 #0b0f19' : '#cbd5e1 #f8fafc',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.28)',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDark
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.45)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '7px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background: isDark
              ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                : 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
            padding: '12px 16px',
          },
          head: {
            fontWeight: 700,
            fontSize: '0.78125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: isDark ? '#94a3b8' : '#64748b',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            fontSize: '0.75rem',
            borderRadius: 6,
            padding: '6px 10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          },
          arrow: {
            color: isDark ? '#1e293b' : '#0f172a',
          },
        },
      },
    },
  })

  return responsiveFontSizes(baseTheme)
}
