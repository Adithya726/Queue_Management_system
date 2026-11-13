import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { chartPoints } from '../utils/format';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload[0].value} waiting
    </div>
  );
}

function QueueTrendChart({ trend, height = 300 }) {
  const data = chartPoints(trend || []);

  if (!data.length) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No trend data yet"
        message="Add and serve a few people to see how the queue length changes over time."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<TrendTooltip />} />
        <Area
          type="monotone"
          dataKey="queueLength"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#trendFill)"
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
          name="Queue length"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default QueueTrendChart;
