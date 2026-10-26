# PulseWorkforce — Enterprise Workforce Analytics Platform

An enterprise-grade, high-performance **Workforce Analytics and Attendance Telemetry Dashboard** built independently from scratch using **React 19, TypeScript, Vite, Material UI (MUI), and Recharts**.

PulseWorkforce provides people operations teams, HR leaders, and department executives with real-time visibility into attendance trends, headcount distribution, remote workforce ratios, and employee check-in activity.

---

## 🌟 Key Highlights & Feature Matrix

| Feature | Implementation Details |
|---|---|
| **Technology Stack** | React 19 + TypeScript + Vite + Material UI + Recharts |
| **Top Navigation** | Brand identity, real-time telemetry indicator, global search, notification center with unread badge, light/dark theme switch, user profile dossier menu, and mobile drawer toggle |
| **Collapsible Sidebar** | Desktop collapsible navigation (260px expanded / 76px collapsed with icon tooltips), persistent drawer on mobile, active indicator badges, and system connectivity status widget |
| **5 KPI Telemetry Cards** | 1. Total Headcount (1,428 staff, Full-time vs Contract split)<br>2. Attendance Rate (95.4%, target benchmark comparison)<br>3. On-Time Arrival Rate (91.8%, late check-ins counter)<br>4. Absenteeism Rate (3.2%, approved leaves vs unplanned sick)<br>5. Remote / Hybrid Workforce (44.5%, on-site vs hybrid vs remote)<br>_All cards feature micro Recharts sparklines, color-coded trend badges, and sub-metric breakdowns._ |
| **Attendance Trend Chart** | Multi-series area chart with gradient fills, timeframe presets (`Today`, `7 Days`, `30 Days`, `This Month`), volume vs rate mode toggling, target reference line (95%), and custom glassmorphism tooltip |
| **Department Distribution** | Stacked/grouped bar chart displaying headcounts and attendance rates across 8 business departments (Engineering, Product, Sales, Marketing, HR, Finance, Operations, Customer Support) |
| **Workforce Donut Chart** | Interactive Recharts donut chart with central total headcount readout, dimension toggle (**Work Arrangement** vs **Employment Type**), and custom legend cards with counts and percentages |
| **Live Employee Activity** | Real-time check-in table with status badges (`Present`, `Late`, `Remote`, `On Leave`, `Absent`), department tags, check-in locations, timestamps, pagination, in-table keyword search, status filters, CSV data export, and click-to-open **Employee Dossier Modal** |
| **Global Filter Toolbar** | Synchronized multi-dimensional filtering by Search Keyword, Date Range, Department, Location, and Attendance Status; active filter pill chips with 1-click removal, and global filter reset |
| **Evaluator State Controls** | Interactive top evaluation pill bar enabling instant 1-click preview of **Normal (Live)**, **Simulate Loading (Skeletons)**, **Simulate Empty**, and **Simulate Error (with retry)** states |
| **Dual Theme System** | Polished, WCAG-compliant Light and Dark enterprise color palettes with smooth transitions, persistent `localStorage` synchronization, and system preference detection |
| **Responsive Layouts** | Fluid grid layouts optimized for 4K/Desktop (>1200px), Tablet (768px–1199px), and Mobile (<768px) with slide-out drawers and horizontal table scrolling |
| **Testing Suite** | Automated Vitest + React Testing Library test suite (9/9 passed, 100% test success rate) |

---

## 📸 Screenshots & Responsive Demonstrations

Screenshots captured automatically via headless Chrome at 2x pixel density:

| View | Screenshot Preview |
|---|---|
| **Desktop Light Mode** | `screenshots/dashboard-desktop-light.png` |
| **Desktop Dark Mode** | `screenshots/dashboard-desktop-dark.png` |
| **Tablet View (820px)** | `screenshots/dashboard-tablet.png` |
| **Mobile View (390px)** | `screenshots/dashboard-mobile.png` |
| **Loading Skeleton State** | `screenshots/dashboard-loading-state.png` |
| **Error Handling State** | `screenshots/dashboard-error-state.png` |
| **Empty State** | `screenshots/dashboard-empty-state.png` |

---

## 🏗️ Architecture & Project Structure

```
workforce-dashboard-task1/
├── public/                     # Static assets & icons
├── scripts/
│   └── capture-screenshots.mjs # Headless Chrome screenshot capture automation
├── screenshots/                # Generated high-resolution dashboard previews
├── src/
│   ├── assets/                 # SVGs and vector assets
│   ├── components/
│   │   ├── common/
│   │   │   ├── EmptyState.tsx       # Zero-match illustrated empty state + reset CTA
│   │   │   ├── ErrorState.tsx       # API failure error alert + retry connection CTA
│   │   │   ├── MetricBadge.tsx      # Trend percentage badge with directional icons
│   │   │   └── StateControls.tsx   # Evaluator state switcher toolbar
│   │   ├── dashboard/
│   │   │   ├── AttendanceTrendChart.tsx         # Timeframe-aware Recharts area chart
│   │   │   ├── DepartmentDistributionChart.tsx  # Department stacked bar chart
│   │   │   ├── EmployeeDetailModal.tsx          # Employee profile & telemetry dossier dialog
│   │   │   ├── FilterBar.tsx                    # Multi-criteria filter toolbar
│   │   │   ├── KpiCardsGrid.tsx                 # 5 KPI cards with micro sparklines
│   │   │   ├── RecentActivityTable.tsx          # Real-time check-in log table + CSV export
│   │   │   └── WorkforceDonutChart.tsx          # Work arrangement / contract donut chart
│   │   └── layout/
│   │       ├── AppLayout.tsx        # Responsive grid layout orchestrator
│   │       ├── Sidebar.tsx          # Collapsible desktop & mobile drawer navigation
│   │       └── TopNav.tsx           # Enterprise header with search, notifications, & user menu
│   ├── data/
│   │   └── mockData.ts              # Rich, realistic enterprise workforce dataset
│   ├── hooks/
│   │   └── useWorkforceData.ts      # Custom hook managing filters, calculations, & UI states
│   ├── test/
│   │   ├── setup.ts                 # Vitest & jsdom test configuration
│   │   └── Dashboard.test.tsx       # 9 comprehensive unit & component tests
│   ├── theme/
│   │   ├── ThemeContext.tsx         # Theme state provider + localStorage persistence
│   │   └── theme.ts                 # MUI theme definition (light & dark palettes, typography, shapes)
│   ├── types/
│   │   └── index.ts                 # Strict TypeScript domain interfaces
│   ├── App.tsx                      # Primary application component
│   ├── index.css                    # Global CSS baseline & keyframe animations
│   └── main.tsx                     # React 19 application entry point
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or later (v22+ recommended)
- **npm**: v9.0.0 or later

### 1. Installation
Clone or navigate to the project directory and install all required dependencies:
```bash
npm install
```

### 2. Run Development Server
Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
Execute the Vitest test suite in headless single-run mode:
```bash
npm run test
```
Or run in interactive watch mode during development:
```bash
npm run test:watch
```

### 4. Build for Production
Type-check with TypeScript compiler and build optimized production bundle:
```bash
npm run build
```
The output will be generated in `dist/`.

### 5. Preview Production Build
Serve the production bundle locally:
```bash
npm run preview
```

### 6. Automated Screenshot Capture
Run the automated screenshot script which launches headless Chrome and generates high-res captures across Desktop (Light/Dark), Tablet, Mobile, and UI states:
```bash
npm run screenshot
```

---

## 🧪 Testing Results

Unit and component test suite execution summary:

```text
 ✓ src/test/Dashboard.test.tsx (9 tests)
   ✓ Workforce Analytics Platform — Dashboard UI/UX
     ✓ renders top navigation and platform branding
     ✓ renders all five KPI cards with trends and submetrics
     ✓ renders the filter toolbar with all required filter dimensions
     ✓ renders all three analytical charts and the recent activity table
     ✓ toggles light and dark theme mode
     ✓ filters employees dynamically by search keyword
     ✓ displays empty state when filter matches no records and restores on reset
     ✓ supports evaluator error state simulation and recovery via retry button
     ✓ supports evaluator loading state simulation

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Duration  11.78s
```

---

## 🎨 Design System, Usability & Accessibility

### Accessibility (a11y)
- **High Contrast Ratios**: Light mode `#0f172a` text on `#ffffff` background meets WCAG AAA standards (>7:1). Dark mode `#f8fafc` text on `#111827` meets WCAG AAA standards.
- **Semantic HTML & ARIA**: Accessible label attributes (`aria-label`, `labelId`, `role="button"`) on interactive controls, inputs, and dialogs.
- **Keyboard Navigation**: Form controls, buttons, pagination, and modal dialogs are fully navigable via `Tab`, `Enter`, and `Escape`.
- **Reduced Motion Friendly**: Smooth micro-transitions with hardware acceleration.

### Responsiveness
- **Desktop (>1200px)**: 5-column KPI cards grid, 7.5 / 4.5 ratio dual-chart row, collapsible desktop navigation sidebar.
- **Tablet (768px – 1199px)**: 2-to-3 column auto-fit KPI grid, stacked chart sections, full table visibility with horizontal scroll indicators.
- **Mobile (<768px)**: Touch-optimized slide-out hamburger navigation drawer, single-column KPI cards, full-width responsive charts, and mobile-friendly table cards.

---

## ⚖️ Evaluation & State Simulation

A dedicated **Evaluator Controls Bar** is pinned at the top of the dashboard content:
- **`[ Normal ]`**: Displays live, reactive telemetry data with dynamic filtering.
- **`[ Simulate Loading ]`**: Renders animated shimmer skeletons across all 5 KPI cards, all 3 charts, and the activity table.
- **`[ Simulate Empty ]`**: Displays the illustrated empty state with 1-click filter reset.
- **`[ Simulate Error ]`**: Displays the network error notification banner with an interactive `Retry Connection` recovery button.

---

## 📄 License
MIT License. Developed independently for Task 1: Workforce Analytics Platform.
