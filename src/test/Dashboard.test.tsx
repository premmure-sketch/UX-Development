import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

describe('Workforce Analytics Platform — Dashboard UI/UX', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders top navigation and platform branding', () => {
    render(<App />)
    expect(screen.getByText('PulseWorkforce')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('Dr. Alistair Vance')).toBeInTheDocument()
    expect(screen.getByText('Workforce Intelligence Dashboard')).toBeInTheDocument()
  })

  it('renders all five KPI cards with trends and submetrics', () => {
    render(<App />)
    expect(screen.getByTestId('kpi-headcount')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-attendance')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-ontime')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-absenteeism')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-remote')).toBeInTheDocument()

    expect(screen.getByText('Total Headcount')).toBeInTheDocument()
    expect(screen.getByText('Attendance Rate')).toBeInTheDocument()
    expect(screen.getByText('On-Time Arrival Rate')).toBeInTheDocument()
    expect(screen.getByText('Absenteeism Rate')).toBeInTheDocument()
    expect(screen.getByText('Remote / Hybrid')).toBeInTheDocument()
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

  it('toggles light and dark theme mode', async () => {
    render(<App />)
    const themeButton = screen.getByLabelText('Toggle light/dark theme')
    expect(themeButton).toBeInTheDocument()

    // Click to toggle
    fireEvent.click(themeButton)
    expect(localStorage.getItem('pulse_workforce_theme')).toBe('dark')

    // Click again to toggle back
    fireEvent.click(themeButton)
    expect(localStorage.getItem('pulse_workforce_theme')).toBe('light')
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

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Workforce Telemetry Matches Found')).toBeInTheDocument()

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

    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText('Unable to Load Workforce Telemetry')).toBeInTheDocument()

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

    // Skeletons are rendered during loading state
    expect(screen.getByText('LOADING')).toBeInTheDocument()
  })
})
