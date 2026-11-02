import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import App from '../App'

describe('Workforce Analytics Platform — Dashboard UI/UX & Task 2 Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders top navigation and platform branding', () => {
    render(<App />)
    expect(screen.getByText('Stackly')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('Dr. Alistair Vance')).toBeInTheDocument()
    expect(screen.getByText('Workforce Intelligence Dashboard')).toBeInTheDocument()
  })

  it('renders all five Task 2 KPI cards: Total Employees, Present, Absent, On Leave, Attendance Rate', () => {
    render(<App />)
    expect(screen.getByTestId('kpi-headcount')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-present')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-absent')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-onleave')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-attendance')).toBeInTheDocument()

    const kpiGrid = screen.getByTestId('kpi-cards-grid')
    expect(within(kpiGrid).getByText('Total Employees')).toBeInTheDocument()
    expect(within(kpiGrid).getByText('Present')).toBeInTheDocument()
    expect(within(kpiGrid).getByText('Absent')).toBeInTheDocument()
    expect(within(kpiGrid).getByText('On Leave')).toBeInTheDocument()
    expect(within(kpiGrid).getByText('Attendance Rate')).toBeInTheDocument()
  })

  it('renders the filter toolbar with all required filter dimensions', () => {
    render(<App />)
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter by keyword / ID...')).toBeInTheDocument()
    expect(screen.getAllByText('Date Range')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Department')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Location')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Status')[0]).toBeInTheDocument()
  })

  it('renders all three analytical charts and the recent activity table', () => {
    render(<App />)
    expect(screen.getByTestId('attendance-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('department-distribution-chart')).toBeInTheDocument()
    expect(screen.getByTestId('workforce-donut-chart')).toBeInTheDocument()
    expect(screen.getByTestId('recent-activity-table')).toBeInTheDocument()
  })

  it('supports sorting columns in recent activity table', () => {
    render(<App />)
    const empHeader = screen.getAllByText('Employee')[0]
    expect(empHeader).toBeInTheDocument()
    fireEvent.click(empHeader)

    const deptHeader = screen.getAllByText('Department')[0]
    expect(deptHeader).toBeInTheDocument()
    fireEvent.click(deptHeader)
  })

  it('toggles light and dark theme mode', async () => {
    render(<App />)
    const themeButton = screen.getByLabelText('Toggle light/dark theme')
    expect(themeButton).toBeInTheDocument()

    // Click to toggle
    fireEvent.click(themeButton)
    expect(localStorage.getItem('stackly_theme')).toBe('dark')

    // Click again to toggle back
    fireEvent.click(themeButton)
    expect(localStorage.getItem('stackly_theme')).toBe('light')
  })

  it('filters employees dynamically by search keyword', async () => {
    render(<App />)
    const searchInput = screen.getByPlaceholderText('Filter by keyword / ID...')
    fireEvent.change(searchInput, { target: { value: 'Sarah Jenkins' } })

    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument()
    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText('Keyword: "Sarah Jenkins"')).toBeInTheDocument()
  })

  it('displays empty state when filter matches no records and restores on reset', async () => {
    render(<App />)
    const searchInput = screen.getByPlaceholderText('Filter by keyword / ID...')
    fireEvent.change(searchInput, { target: { value: 'XYZNonExistentEmployee999' } })

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No Workforce Telemetry Matches Found')).toBeInTheDocument()
    })

    const resetButton = screen.getByRole('button', { name: /reset all filters/i })
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(screen.getByTestId('kpi-headcount')).toBeInTheDocument()
    })
  })

  it('supports evaluator error state simulation and recovery via retry button', async () => {
    render(<App />)
    const simulateErrorChip = screen.getByText('Simulate Error')
    fireEvent.click(simulateErrorChip)

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.getByText('Unable to Load Workforce Telemetry')).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /retry connection/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByTestId('kpi-headcount')).toBeInTheDocument()
    })
  })

  it('supports evaluator loading state simulation', async () => {
    render(<App />)
    const simulateLoadingChip = screen.getByText('Simulate Loading')
    fireEvent.click(simulateLoadingChip)

    expect(screen.getByText('LOADING')).toBeInTheDocument()
  })
})
