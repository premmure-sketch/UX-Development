import React from 'react'
import {
  Box,
  Typography,
  Grid,
} from '@mui/material'
import { ThemeContextProvider } from './theme/ThemeContext'
import { AppLayout } from './components/layout/AppLayout'
import { StateControls } from './components/common/StateControls'
import { EmptyState } from './components/common/EmptyState'
import { ErrorState } from './components/common/ErrorState'
import { FilterBar } from './components/dashboard/FilterBar'
import { KpiCardsGrid } from './components/dashboard/KpiCardsGrid'
import { AttendanceTrendChart } from './components/dashboard/AttendanceTrendChart'
import { DepartmentDistributionChart } from './components/dashboard/DepartmentDistributionChart'
import { WorkforceDonutChart } from './components/dashboard/WorkforceDonutChart'
import { RecentActivityTable } from './components/dashboard/RecentActivityTable'
import { useWorkforceData } from './hooks/useWorkforceData'

const DashboardContent: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    uiState,
    errorMessage,
    simulateLoading,
    simulateError,
    simulateEmpty,
    resetState,
    employees,
    kpiData,
    trendData,
    departmentData,
    workforceBreakdown,
    donutDimension,
    setDonutDimension,
    setDatePreset,
  } = useWorkforceData()

  const isLoading = uiState === 'loading'

  return (
    <AppLayout
      searchValue={filters.search}
      onSearchChange={(val) => updateFilter('search', val)}
    >
      {/* Dashboard Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em', mb: 0.5 }}>
              Workforce Intelligence Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time enterprise attendance telemetry, headcounts, department distribution, and remote logs
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Evaluator State Controls Bar */}
      <StateControls
        currentState={uiState}
        onSimulateLoading={simulateLoading}
        onSimulateError={simulateError}
        onSimulateEmpty={simulateEmpty}
        onResetState={resetState}
      />

      {/* Global Filter Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        activeCount={activeFilterCount}
      />

      {/* Conditional Rendering of States */}
      {uiState === 'error' ? (
        <ErrorState
          message={errorMessage}
          onRetry={resetState}
        />
      ) : uiState === 'empty' ? (
        <EmptyState
          title="No Workforce Telemetry Matches Found"
          description="None of the employees match your active search, department, location, or status filters. Reset your filters to restore live analytics."
          onReset={resetFilters}
        />
      ) : (
        <>
          {/* Section 1: Five KPI Cards */}
          <KpiCardsGrid kpiData={kpiData} isLoading={isLoading} />

          {/* Section 2: Charts Row 1 (Attendance Trend Chart + Workforce Donut Chart) */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, lg: 7.5 }}>
              <AttendanceTrendChart
                data={trendData}
                currentPreset={filters.datePreset}
                onPresetChange={setDatePreset}
                isLoading={isLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 4.5 }}>
              <WorkforceDonutChart
                data={workforceBreakdown}
                dimension={donutDimension}
                onDimensionChange={setDonutDimension}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>

          {/* Section 3: Department-Wise Distribution Bar Chart */}
          <Box sx={{ mb: 3 }}>
            <DepartmentDistributionChart
              data={departmentData}
              isLoading={isLoading}
            />
          </Box>

          {/* Section 4: Recent Employee Activity Table */}
          <Box sx={{ mb: 4 }}>
            <RecentActivityTable
              employees={employees}
              isLoading={isLoading}
            />
          </Box>
        </>
      )}
    </AppLayout>
  )
}

export default function App() {
  return (
    <ThemeContextProvider>
      <DashboardContent />
    </ThemeContextProvider>
  )
}
