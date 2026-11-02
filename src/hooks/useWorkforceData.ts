import { useState, useMemo, useCallback, useEffect } from 'react'
import { apiService } from '../services/api'
import {
  MOCK_EMPLOYEES,
  ATTENDANCE_TREND_DATA,
  DEPARTMENTS,
} from '../data/mockData'
import type {
  Employee,
  DashboardFilters,
  DashboardKpiSummary,
  AttendanceTrendPoint,
  DepartmentDistributionPoint,
  WorkforceBreakdownItem,
  UIState,
  DatePreset,
  EmployeeSortField,
  SortOrder,
} from '../types'

const INITIAL_FILTERS: DashboardFilters = {
  search: '',
  datePreset: 'last7days',
  department: 'All',
  location: 'All',
  status: 'All',
}

const DEFAULT_KPIS: DashboardKpiSummary = {
  totalEmployees: {
    value: 1428,
    displayValue: '1,428',
    trend: +3.8,
    isPositive: true,
    benchmarkLabel: 'vs last month (+52 net)',
    subMetrics: [{ label: 'Full-time', value: '1,238' }, { label: 'Contract / Temp', value: '190' }],
    sparkline: [1380, 1395, 1400, 1412, 1420, 1425, 1428],
  },
  present: {
    value: 1354,
    displayValue: '1,354',
    trend: +1.4,
    isPositive: true,
    benchmarkLabel: '94.8% of total workforce',
    subMetrics: [{ label: 'In-Office', value: '714' }, { label: 'Remote / WFH', value: '640' }],
    sparkline: [1290, 1310, 1325, 1340, 1335, 1350, 1354],
  },
  absent: {
    value: 46,
    displayValue: '46',
    trend: -0.6,
    isPositive: true,
    benchmarkLabel: 'target <3% unnotified',
    subMetrics: [{ label: 'Unnotified / Sick', value: '46' }, { label: 'Late check-ins', value: '48' }],
    sparkline: [52, 48, 44, 42, 45, 40, 46],
  },
  onLeave: {
    value: 28,
    displayValue: '28',
    trend: 0.0,
    isPositive: true,
    benchmarkLabel: 'approved PTO / parental / medical',
    subMetrics: [{ label: 'Approved PTO', value: '20' }, { label: 'Parental / Medical', value: '8' }],
    sparkline: [30, 32, 28, 30, 31, 29, 28],
  },
  attendanceRate: {
    value: 95.4,
    displayValue: '95.4%',
    trend: +0.4,
    isPositive: true,
    benchmarkLabel: 'target benchmark 95.0%',
    subMetrics: [{ label: 'Active Today', value: '1,354' }, { label: 'Target', value: '95.0%' }],
    sparkline: [95.2, 95.8, 96.1, 96.5, 96.2, 96.9, 95.4],
  },
  totalHeadcount: {
    value: 1428,
    displayValue: '1,428',
    trend: +3.8,
    isPositive: true,
    benchmarkLabel: 'vs last month',
    subMetrics: [{ label: 'Full-time', value: '1,238' }, { label: 'Contract', value: '190' }],
    sparkline: [1380, 1395, 1400, 1412, 1420, 1425, 1428],
  },
  onTimeArrivalRate: {
    value: 91.8,
    displayValue: '91.8%',
    trend: -0.5,
    isPositive: true,
    benchmarkLabel: 'vs yesterday',
    subMetrics: [{ label: 'On-time', value: '1,210' }, { label: 'Late check-ins', value: '48' }],
    sparkline: [93.1, 92.4, 91.8, 92.6, 92.0, 91.5, 91.8],
  },
  remoteWorkforce: {
    value: 44.5,
    displayValue: '44.5%',
    trend: +4.2,
    isPositive: true,
    benchmarkLabel: 'hybrid & remote distribution',
    subMetrics: [{ label: 'Hybrid / Remote', value: '635' }, { label: 'Dedicated On-Site', value: '793' }],
    sparkline: [41.2, 42.0, 42.5, 43.1, 43.8, 44.0, 44.5],
  },
}

export const useWorkforceData = () => {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState<EmployeeSortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(6)
  const [totalCount, setTotalCount] = useState<number>(MOCK_EMPLOYEES.length)
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(MOCK_EMPLOYEES.length / 6))

  const [uiState, setUiState] = useState<UIState>('normal')
  const [simulatedState, setSimulatedState] = useState<UIState | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chartMetric, setChartMetric] = useState<'attendance' | 'headcount'>('attendance')
  const [donutDimension, setDonutDimension] = useState<'arrangement' | 'type'>('arrangement')

  // Live state from SQLite
  const [kpiData, setKpiData] = useState<DashboardKpiSummary>(DEFAULT_KPIS)
  const [trendData, setTrendData] = useState<AttendanceTrendPoint[]>(ATTENDANCE_TREND_DATA.last7days)
  const [departmentData, setDepartmentData] = useState<DepartmentDistributionPoint[]>(
    DEPARTMENTS.map((d) => ({
      department: d.name,
      shortName: d.shortName,
      headcount: 178,
      present: 155,
      late: 8,
      remote: 10,
      absent: 5,
      attendanceRate: 97.2,
    }))
  )
  const [workforceBreakdown, setWorkforceBreakdown] = useState<WorkforceBreakdownItem[]>([
    { name: 'In-Office', value: 714, percentage: 50.0, color: '#3b82f6' },
    { name: 'Hybrid', value: 476, percentage: 33.3, color: '#8b5cf6' },
    { name: 'Fully Remote', value: 238, percentage: 16.7, color: '#10b981' },
  ])
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES.slice(0, 6))

  // Filter handlers
  const updateFilter = useCallback(<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // reset to first page on filter change
    setSimulatedState(null)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
    setSimulatedState(null)
    setErrorMessage(null)
  }, [])

  // Sorting handler
  const handleSort = useCallback((field: EmployeeSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }, [sortBy])

  // Evaluator simulators
  const simulateLoading = useCallback(() => {
    setSimulatedState('loading')
    setTimeout(() => {
      setSimulatedState(null)
    }, 1500)
  }, [])

  const simulateError = useCallback(() => {
    setSimulatedState('error')
    setErrorMessage('Failed to fetch workforce telemetry from SQLite backend (HTTP 503 Service Unavailable).')
  }, [])

  const simulateEmpty = useCallback(() => {
    setSimulatedState('empty')
  }, [])

  const resetState = useCallback(() => {
    setSimulatedState(null)
    setErrorMessage(null)
  }, [])

  // Load telemetry from backend API / SQLite
  const loadData = useCallback(async () => {
    try {
      // 1. Fetch KPI summary from SQLite
      const kpis = await apiService.getKpiStats(filters)
      setKpiData(kpis)

      // 2. Fetch Trends
      const trends = await apiService.getAttendanceTrends(filters)
      setTrendData(trends)

      // 3. Fetch Department Distribution
      const depts = await apiService.getDepartmentDistribution(filters)
      setDepartmentData(depts)

      // 4. Fetch Workforce Composition
      const composition = await apiService.getWorkforceComposition(donutDimension, filters)
      setWorkforceBreakdown(composition)

      // 5. Fetch Paginated Employees
      const empResult = await apiService.getEmployees({
        search: filters.search,
        department: filters.department,
        location: filters.location,
        status: filters.status,
        sortBy,
        sortOrder,
        page,
        pageSize,
      })

      setEmployees(empResult.items)
      setTotalCount(empResult.total)
      setTotalPages(empResult.totalPages)

      // Automatically identify empty state if zero matches found
      if (empResult.total === 0) {
        setUiState('empty')
      } else {
        setUiState('normal')
      }
    } catch (err: any) {
      console.error('[useWorkforceData.loadData] Error:', err)
      setErrorMessage(err.message || 'Failed to load workforce telemetry')
      setUiState('error')
    }
  }, [filters, sortBy, sortOrder, page, pageSize, donutDimension])

  // Trigger data load on filter, sort, page, or dimension change
  useEffect(() => {
    loadData()
  }, [loadData])

  // Effective UI state (simulation overrides real state)
  const effectiveState: UIState = useMemo(() => {
    if (simulatedState) return simulatedState
    if (uiState !== 'normal') return uiState
    if (totalCount === 0 || employees.length === 0) return 'empty'
    return 'normal'
  }, [simulatedState, uiState, totalCount, employees.length])

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.datePreset !== 'last7days') count++
    if (filters.department !== 'All') count++
    if (filters.location !== 'All') count++
    if (filters.status !== 'All') count++
    return count
  }, [filters])

  return {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    uiState: effectiveState,
    setUiState,
    errorMessage,
    simulateLoading,
    simulateError,
    simulateEmpty,
    resetState,
    refreshData: loadData,
    // Data objects
    employees,
    totalCount,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    handleSort,
    kpiData,
    trendData,
    departmentData,
    workforceBreakdown,
    chartMetric,
    setChartMetric,
    donutDimension,
    setDonutDimension,
    setDatePreset: (preset: DatePreset) => updateFilter('datePreset', preset),
  }
}
