import { Box, Typography } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import type { ReactNode } from 'react';
export default function KpiCard({ title, value, delta, note, icon, tint }: { title: string; value: string; delta: string; note: string; icon: ReactNode; tint: string }) {
  return <Box className="kpi-card"><Box className="kpi-top"><Typography className="kpi-label">{title}</Typography><Box className="kpi-icon" sx={{ color: tint, backgroundColor: `${tint}18` }}>{icon}</Box></Box><Typography className="kpi-value">{value}</Typography><Box className="kpi-foot"><Box className="delta"><TrendingUpRoundedIcon fontSize="inherit" /> {delta}</Box><Typography variant="caption" color="text.secondary">{note}</Typography></Box></Box>;
}
