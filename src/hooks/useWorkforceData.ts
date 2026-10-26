import { useState, useMemo, useCallback } from 'react'
import {
  MOCK_EMPLOYEES,
  ATTENDANCE_TREND_DATA,
  DEPARTMENTS,
} from '../data/mockData'
import type {
  DashboardFilters,
  DashboardKpiSummary,
  AttendanceTrendPoint,
  DepartmentDistributionPoint,
  WorkforceBreakdownItem,
  UIState,
  DatePreset,
} from '../types'

const INITIAL_FILTERS: DashboardFilters = {
  search: '',
  datePreset: 'last7days',
  department: 'All',
  location: 'All',
  status: 'All',
}

export const useWorkforceData = () => {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS)
  const [uiState, setUiState] = useState<UIState>('normal')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chartMetric, setChartMetric] = useState<'attendance' | 'headcount'>('attendance')
  const [donutDimension, setDonutDimension] = useState<'arrangement' | 'type'>('arrangement')

  // Filter handlers
  const updateFilter = useCallback(<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setUiState('normal')
    setErrorMessage(null)
  }, [])

  // State simulators for evaluators
  const simulateLoading = useCallback(() => {
    setUiState('loading')
    setTimeout(() => {
      setUiState('normal')
    }, 1500)
  }, [])

  const simulateError = useCallback(() => {
    setUiState('error')
    setErrorMessage('Failed to fetch workforce telemetry from sync service (HTTP 503 Service Unavailable).')
  }, [])

  const simulateEmpty = useCallback(() => {
    setUiState('empty')
  }, [])

  const resetState = useCallback(() => {
    setUiState('normal')
    setErrorMessage(null)
  }, [])

  // Filtered employee pool
  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      // Keyword search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase()
        const matchName = emp.name.toLowerCase().includes(query)
        const matchRole = emp.role.toLowerCase().includes(query)
        const matchEmail = emp.email.toLowerCase().includes(query)
        const matchId = emp.id.toLowerCase().includes(query)
        if (!matchName && !matchRole && !matchEmail && !matchId) return false
      }

      // Department filter
      if (filters.department !== 'All' && emp.department !== filters.department) {
        return false
      }

      // Location filter
      if (filters.location !== 'All' && emp.location !== filters.location) {
        return false
      }

      // Status filter
      if (filters.status !== 'All' && emp.status !== filters.status) {
        return false
      }

      return true
    })
  }, [filters])

  // Effective UI state (automatically detect empty if normal but 0 records found)
  const effectiveState: UIState = useMemo(() => {
    if (uiState !== 'normal') return uiState
    if (filteredEmployees.length === 0) return 'empty'
    return 'normal'
  }, [uiState, filteredEmployees.length])

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

  // Scaled calculations for enterprise feel (base enterprise pool is 1,428 employees)
  const enterpriseScaleFactor = useMemo(() => {
    const rawTotal = MOCK_EMPLOYEES.length
    return 1428 / rawTotal
  }, [])

  // KPI Calculations
  const kpiData: DashboardKpiSummary = useMemo(() => {
    const totalCount = filteredEmployees.length
    if (totalCount === 0) {
      return {
        totalHeadcount: {
          value: 0,
          displayValue: '0',
          trend: 0,
          isPositive: true,
          benchmarkLabel: 'vs last month',
          subMetrics: [{ label: 'Full-time', value: 0 }, { label: 'Contract', value: 0 }],
          sparkline: [0, 0, 0, 0, 0, 0, 0],
        },
        attendanceRate: {
          value: 0,
          displayValue: '0.0%',
          trend: 0,
          isPositive: true,
          benchmarkLabel: 'target 95.0%',
          subMetrics: [{ label: 'Present Today', value: 0 }, { label: 'Target', value: '95.0%' }],
          sparkline: [0, 0, 0, 0, 0, 0, 0],
        },
        onTimeArrivalRate: {
          value: 0,
          displayValue: '0.0%',
          trend: 0,
          isPositive: true,
          benchmarkLabel: 'vs yesterday',
          subMetrics: [{ label: 'On-time', value: 0 }, { label: 'Late check-ins', value: 0 }],
          sparkline: [0, 0, 0, 0, 0, 0, 0],
        },
        absenteeismRate: {
          value: 0,
          displayValue: '0.0%',
          trend: 0,
          isPositive: true,
          benchmarkLabel: 'vs target (<4%)',
          subMetrics: [{ label: 'Approved Leave', value: 0 }, { label: 'Unplanned/Sick', value: 0 }],
          sparkline: [0, 0, 0, 0, 0, 0, 0],
        },
        remoteWorkforce: {
          value: 0,
          displayValue: '0.0%',
          trend: 0,
          isPositive: true,
          benchmarkLabel: 'of total staff',
          subMetrics: [{ label: 'In-Office', value: 0 }, { label: 'Hybrid/Remote', value: 0 }],
          sparkline: [0, 0, 0, 0, 0, 0, 0],
        },
      }
    }

    const scaledTotal = Math.round(totalCount * enterpriseScaleFactor)
    const presentRaw = filteredEmployees.filter((e) => e.status === 'Present').length
    const lateRaw = filteredEmployees.filter((e) => e.status === 'Late').length
    const remoteRaw = filteredEmployees.filter((e) => e.status === 'Remote').length
    const leaveRaw = filteredEmployees.filter((e) => e.status === 'On Leave').length
    const absentRaw = filteredEmployees.filter((e) => e.status === 'Absent').length
    const fullTimeRaw = filteredEmployees.filter((e) => e.workType === 'Full-time').length

    const attendedRaw = presentRaw + lateRaw + remoteRaw
    const attendanceRateVal = ((attendedRaw / totalCount) * 100)

    const onTimeTotal = presentRaw + lateRaw
    const onTimeRateVal = onTimeTotal > 0 ? ((presentRaw / onTimeTotal) * 100) : 100

    const absentRateVal = (((absentRaw + leaveRaw) / totalCount) * 100)

    const remoteHybridRaw = filteredEmployees.filter(
      (e) => e.workArrangement === 'Remote' || e.workArrangement === 'Hybrid'
    ).length
    const inOfficeRaw = totalCount - remoteHybridRaw
    const remoteRateVal = ((remoteHybridRaw / totalCount) * 100)

    const scaledFullTime = Math.round(fullTimeRaw * enterpriseScaleFactor)
    const scaledContract = Math.max(0, scaledTotal - scaledFullTime)
    const scaledPresent = Math.round(attendedRaw * enterpriseScaleFactor)
    const scaledLate = Math.round(lateRaw * enterpriseScaleFactor)
    const scaledOnTime = Math.round(presentRaw * enterpriseScaleFactor)
    const scaledLeave = Math.round(leaveRaw * enterpriseScaleFactor)
    const scaledAbsent = Math.round(absentRaw * enterpriseScaleFactor)
    const scaledRemote = Math.round(remoteHybridRaw * enterpriseScaleFactor)
    const scaledInOffice = Math.round(inOfficeRaw * enterpriseScaleFactor)

    return {
      totalHeadcount: {
        value: scaledTotal,
        displayValue: scaledTotal.toLocaleString(),
        trend: +3.8,
        isPositive: true,
        benchmarkLabel: 'vs last month',
        subMetrics: [
          { label: 'Full-time', value: scaledFullTime.toLocaleString() },
          { label: 'Contract/Temp', value: scaledContract.toLocaleString() },
        ],
        sparkline: [1360, 1378, 1395, 1402, 1415, 1420, scaledTotal],
      },
      attendanceRate: {
        value: attendanceRateVal,
        displayValue: `${attendanceRateVal.toFixed(1)}%`,
        trend: +(attendanceRateVal - 95.0).toFixed(1),
        isPositive: attendanceRateVal >= 95.0,
        benchmarkLabel: 'target 95.0%',
        subMetrics: [
          { label: 'Present Today', value: scaledPresent.toLocaleString() },
          { label: 'Target', value: '95.0%' },
        ],
        sparkline: [95.2, 96.1, 95.8, 96.9, 97.2, 96.4, Number(attendanceRateVal.toFixed(1))],
      },
      onTimeArrivalRate: {
        value: onTimeRateVal,
        displayValue: `${onTimeRateVal.toFixed(1)}%`,
        trend: -0.6,
        isPositive: onTimeRateVal >= 90.0,
        benchmarkLabel: 'vs yesterday (92.4%)',
        subMetrics: [
          { label: 'On-time', value: scaledOnTime.toLocaleString() },
          { label: 'Late check-ins', value: scaledLate.toLocaleString() },
        ],
        sparkline: [93.4, 92.8, 93.1, 91.5, 92.4, 91.8, Number(onTimeRateVal.toFixed(1))],
      },
      absenteeismRate: {
        value: absentRateVal,
        displayValue: `${absentRateVal.toFixed(1)}%`,
        trend: -0.4,
        isPositive: absentRateVal <= 4.0, // lower is better
        benchmarkLabel: 'healthy benchmark <4%',
        subMetrics: [
          { label: 'Approved Leave', value: scaledLeave.toLocaleString() },
          { label: 'Unplanned/Sick', value: scaledAbsent.toLocaleString() },
        ],
        sparkline: [4.1, 3.8, 3.9, 3.6, 3.4, 3.3, Number(absentRateVal.toFixed(1))],
      },
      remoteWorkforce: {
        value: remoteRateVal,
        displayValue: `${remoteRateVal.toFixed(1)}%`,
        trend: +4.2,
        isPositive: true,
        benchmarkLabel: 'of total workforce',
        subMetrics: [
          { label: 'Hybrid/Remote', value: scaledRemote.toLocaleString() },
          { label: 'On-Site Only', value: scaledInOffice.toLocaleString() },
        ],
        sparkline: [40.2, 41.5, 42.0, 42.8, 43.5, 44.1, Number(remoteRateVal.toFixed(1))],
      },
    }
  }, [filteredEmployees, enterpriseScaleFactor])

  // Trend Chart Data (scaled dynamically by filter ratio)
  const trendData: AttendanceTrendPoint[] = useMemo(() => {
    const rawTrend = ATTENDANCE_TREND_DATA[filters.datePreset] || ATTENDANCE_TREND_DATA.last7days
    const ratio = Math.max(0.1, filteredEmployees.length / MOCK_EMPLOYEES.length)

    return rawTrend.map((point) => ({
      ...point,
      present: Math.round(point.present * ratio),
      late: Math.round(point.late * ratio),
      remote: Math.round(point.remote * ratio),
      absent: Math.round(point.absent * ratio),
    }))
  }, [filters.datePreset, filteredEmployees.length])

  // Department distribution
  const departmentData: DepartmentDistributionPoint[] = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      // Find all matching in filtered pool, or in mock if department is 'All'
      const deptEmployees = filteredEmployees.filter((e) => e.department === dept.name)
      const count = deptEmployees.length
      const scaledHeadcount = Math.round(count * enterpriseScaleFactor)

      const presentCount = deptEmployees.filter((e) => e.status === 'Present').length
      const lateCount = deptEmployees.filter((e) => e.status === 'Late').length
      const remoteCount = deptEmployees.filter((e) => e.status === 'Remote').length
      const absentCount = deptEmployees.filter((e) => e.status === 'Absent' || e.status === 'On Leave').length

      const attended = presentCount + lateCount + remoteCount
      const rate = count > 0 ? (attended / count) * 100 : 0

      return {
        department: dept.name,
        shortName: dept.shortName,
        headcount: scaledHeadcount,
        present: Math.round(presentCount * enterpriseScaleFactor),
        late: Math.round(lateCount * enterpriseScaleFactor),
        remote: Math.round(remoteCount * enterpriseScaleFactor),
        absent: Math.round(absentCount * enterpriseScaleFactor),
        attendanceRate: Number(rate.toFixed(1)),
      }
    })
  }, [filteredEmployees, enterpriseScaleFactor])

  // Donut chart breakdown items
  const workforceBreakdown: WorkforceBreakdownItem[] = useMemo(() => {
    const total = filteredEmployees.length
    if (total === 0) return []

    if (donutDimension === 'arrangement') {
      const inOffice = filteredEmployees.filter((e) => e.workArrangement === 'In-Office').length
      const hybrid = filteredEmployees.filter((e) => e.workArrangement === 'Hybrid').length
      const remote = filteredEmployees.filter((e) => e.workArrangement === 'Remote').length

      return [
        {
          name: 'In-Office',
          value: Math.round(inOffice * enterpriseScaleFactor),
          percentage: Number(((inOffice / total) * 100).toFixed(1)),
          color: '#3b82f6',
        },
        {
          name: 'Hybrid',
          value: Math.round(hybrid * enterpriseScaleFactor),
          percentage: Number(((hybrid / total) * 100).toFixed(1)),
          color: '#8b5cf6',
        },
        {
          name: 'Fully Remote',
          value: Math.round(remote * enterpriseScaleFactor),
          percentage: Number(((remote / total) * 100).toFixed(1)),
          color: '#10b981',
        },
      ]
    } else {
      // By Employment Type
      const fullTime = filteredEmployees.filter((e) => e.workType === 'Full-time').length
      const contract = filteredEmployees.filter((e) => e.workType === 'Contract').length
      const partTime = filteredEmployees.filter((e) => e.workType === 'Part-time').length
      const intern = filteredEmployees.filter((e) => e.workType === 'Intern').length

      return [
        {
          name: 'Full-time',
          value: Math.round(fullTime * enterpriseScaleFactor),
          percentage: Number(((fullTime / total) * 100).toFixed(1)),
          color: '#6366f1',
        },
        {
          name: 'Contract',
          value: Math.round(contract * enterpriseScaleFactor),
          percentage: Number(((contract / total) * 100).toFixed(1)),
          color: '#06b6d4',
        },
        {
          name: 'Part-time',
          value: Math.round(partTime * enterpriseScaleFactor),
          percentage: Number(((partTime / total) * 100).toFixed(1)),
          color: '#f59e0b',
        },
        {
          name: 'Intern',
          value: Math.round(intern * enterpriseScaleFactor),
          percentage: Number(((intern / total) * 100).toFixed(1)),
          color: '#ec4899',
        },
      ]
    }
  }, [filteredEmployees, donutDimension, enterpriseScaleFactor])

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
    employees: filteredEmployees,
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
