import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../components/common/EmptyState';
import { chartPoints } from '../utils/format';
import './analytics.css';

function QueueTrendChart({ trend, height = 320 }) {
  const data = chartPoints(trend);

  if (!data.length) {
    return (
      <EmptyState
        title="No trend data yet"
        message="Add people to this queue to plot how length changes over time."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="queueLength"
          stroke="#4f46e5"
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Queue length"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default QueueTrendChart;
