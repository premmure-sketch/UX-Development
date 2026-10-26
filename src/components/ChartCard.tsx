import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
export default function ChartCard({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <Box className={`panel ${className}`}><Box className="panel-heading"><Box><Typography className="panel-title">{title}</Typography>{subtitle && <Typography className="panel-subtitle">{subtitle}</Typography>}</Box>{action}</Box>{children}</Box>;
}
