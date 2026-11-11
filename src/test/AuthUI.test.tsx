import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import { LoginView } from '../components/auth/LoginView'
import { AccessDeniedPage } from '../components/common/AccessDeniedPage'
import { AuthProvider } from '../context/AuthContext'
import { ThemeContextProvider } from '../theme/ThemeContext'

describe('Authentication & Role-Based Access Control — Frontend UI Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders login screen when logged out with brand and all 5 demo roles', () => {
    localStorage.setItem('stackly_logged_out', 'true')
    render(<App />)

    expect(screen.getByTestId('login-view')).toBeInTheDocument()
    expect(screen.getByText('Stackly Workforce')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
    expect(screen.getByTestId('btn-login')).toBeInTheDocument()

    // All 5 demo roles must be available for evaluation
    expect(screen.getByTestId('demo-role-admin')).toBeInTheDocument()
    expect(screen.getByTestId('demo-role-hr')).toBeInTheDocument()
    expect(screen.getByTestId('demo-role-manager')).toBeInTheDocument()
    expect(screen.getByTestId('demo-role-team-lead')).toBeInTheDocument()
    expect(screen.getByTestId('demo-role-employee')).toBeInTheDocument()
  })

  it('clicking demo role pill updates credentials and selected role', () => {
    render(
      <ThemeContextProvider>
        <AuthProvider>
          <LoginView />
        </AuthProvider>
      </ThemeContextProvider>
    )

    const hrPill = screen.getByTestId('demo-role-hr')
    fireEvent.click(hrPill)

    const emailInput = screen.getByTestId('input-email').querySelector('input')
    expect(emailInput?.value).toBe('hr@stackly.com')
    expect(screen.getByText('Sign In as HR')).toBeInTheDocument()

    const empPill = screen.getByTestId('demo-role-employee')
    fireEvent.click(empPill)

    const empEmail = screen.getByTestId('input-email').querySelector('input')
    expect(empEmail?.value).toBe('employee@stackly.com')
    expect(screen.getByText('Sign In as Employee')).toBeInTheDocument()
  })

  it('renders 403 Access Denied page when user lacks required role permissions', () => {
    render(
      <ThemeContextProvider>
        <AuthProvider>
          <AccessDeniedPage
            requiredRoles={['Admin']}
            requiredPermission="audit:read"
          />
        </AuthProvider>
      </ThemeContextProvider>
    )

    expect(screen.getByTestId('access-denied-page')).toBeInTheDocument()
    expect(screen.getByText('403 — Access Forbidden')).toBeInTheDocument()
    expect(screen.getByText('REQUIRED ROLES:')).toBeInTheDocument()
    expect(screen.getByText('audit:read')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument()
  })

  it('allows user to sign out and return to the login screen', async () => {
    render(<App />)

    // Initially in dashboard (Admin Dr. Alistair Vance)
    expect(screen.getByText('Dr. Alistair Vance')).toBeInTheDocument()

    const userMenuButton = screen.getByTestId('user-menu-button')
    fireEvent.click(userMenuButton)

    const signOutOption = screen.getByTestId('menu-item-signout')
    fireEvent.click(signOutOption)

    await waitFor(() => {
      expect(screen.getByTestId('login-view')).toBeInTheDocument()
      expect(localStorage.getItem('stackly_logged_out')).toBe('true')
    })
  }, 15000)
})
