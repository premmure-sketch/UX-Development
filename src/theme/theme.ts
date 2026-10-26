import { createTheme } from '@mui/material/styles';
export const makeTheme = (mode: 'light' | 'dark') => createTheme({
  palette: { mode, primary: { main: '#6558d3' }, secondary: { main: '#2e9d87' }, background: { default: mode === 'light' ? '#f5f7fb' : '#10131c', paper: mode === 'light' ? '#ffffff' : '#191e2a' }, text: { primary: mode === 'light' ? '#20243a' : '#f3f4f8', secondary: mode === 'light' ? '#7b8197' : '#a2a9bc' }, divider: mode === 'light' ? '#edf0f6' : '#2a3040' },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 14 }, components: { MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }, MuiButton: { defaultProps: { disableElevation: true } } },
});
