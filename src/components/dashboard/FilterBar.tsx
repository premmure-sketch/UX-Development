import React from 'react'
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Typography,
  useTheme,
  type SelectChangeEvent,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined'
import { DEPARTMENTS, LOCATIONS } from '../../data/mockData'
import type { DashboardFilters, DatePreset } from '../../types'

interface FilterBarProps {
  filters: DashboardFilters
  onFilterChange: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void
  onResetFilters: () => void
  activeCount: number
}

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today (Live)' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
]

const STATUS_OPTIONS = ['All', 'Present', 'Late', 'Remote', 'On Leave', 'Absent']

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeCount,
}) => {
  const theme = useTheme()

  const handleSelectChange = (field: keyof DashboardFilters) => (e: SelectChangeEvent) => {
    onFilterChange(field, e.target.value as any)
  }

  return (
    <Paper
      data-testid="filter-bar"
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Workforce Filters & Scope
          </Typography>
          {activeCount > 0 && (
            <Chip
              label={`${activeCount} applied`}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
        </Box>

        {activeCount > 0 && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<RestartAltIcon />}
            onClick={onResetFilters}
            sx={{ borderRadius: 2 }}
          >
            Clear All Filters
          </Button>
        )}
      </Box>

      {/* Filter Inputs Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Filter by keyword / ID..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: '100%' }}
        />

        {/* Date Preset */}
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-date-label">Date Range</InputLabel>
          <Select
            labelId="filter-date-label"
            value={filters.datePreset}
            label="Date Range"
            onChange={handleSelectChange('datePreset')}
            startAdornment={
              <InputAdornment position="start">
                <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
              </InputAdornment>
            }
          >
            {DATE_PRESETS.map((preset) => (
              <MenuItem key={preset.value} value={preset.value}>
                {preset.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Department */}
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-dept-label">Department</InputLabel>
          <Select
            labelId="filter-dept-label"
            value={filters.department}
            label="Department"
            onChange={handleSelectChange('department')}
            startAdornment={
              <InputAdornment position="start">
                <CorporateFareOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="All">All Departments</MenuItem>
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept.name} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Location */}
        <FormControl size="small" fullWidth>
          <InputLabel id="filter-location-label">Location</InputLabel>
          <Select
            labelId="filter-location-label"
            value={filters.location}
            label="Location"
            onChange={handleSelectChange('location')}
            startAdornment={
              <InputAdornment position="start">
                <PlaceOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="All">All Locations</MenuItem>
            {LOCATIONS.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Attendance Status */}
        <FormControl size="small" fullWidth sx={{ gridColumn: { sm: 'span 2', md: 'auto' } }}>
          <InputLabel id="filter-status-label">Status</InputLabel>
          <Select
            labelId="filter-status-label"
            value={filters.status}
            label="Status"
            onChange={handleSelectChange('status')}
            startAdornment={
              <InputAdornment position="start">
                <HowToRegOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
              </InputAdornment>
            }
          >
            {STATUS_OPTIONS.map((st) => (
              <MenuItem key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Active Filter Chips Row */}
      {activeCount > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2, pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Active filters:
          </Typography>

          {filters.search && (
            <Chip
              size="small"
              label={`Keyword: "${filters.search}"`}
              onDelete={() => onFilterChange('search', '')}
              variant="outlined"
            />
          )}

          {filters.datePreset !== 'last7days' && (
            <Chip
              size="small"
              label={`Period: ${DATE_PRESETS.find((d) => d.value === filters.datePreset)?.label}`}
              onDelete={() => onFilterChange('datePreset', 'last7days')}
              variant="outlined"
            />
          )}

          {filters.department !== 'All' && (
            <Chip
              size="small"
              label={`Dept: ${filters.department}`}
              onDelete={() => onFilterChange('department', 'All')}
              variant="outlined"
              color="primary"
            />
          )}

          {filters.location !== 'All' && (
            <Chip
              size="small"
              label={`Location: ${filters.location}`}
              onDelete={() => onFilterChange('location', 'All')}
              variant="outlined"
            />
          )}

          {filters.status !== 'All' && (
            <Chip
              size="small"
              label={`Status: ${filters.status}`}
              onDelete={() => onFilterChange('status', 'All')}
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      )}
    </Paper>
  )
}
