export function formatMinutes(value) {
  const minutes = Number(value || 0);
  if (minutes <= 0) {
    return '0 min';
  }
  if (minutes < 1) {
    return `${Math.max(1, Math.round(minutes * 60))}s`;
  }
  return `${minutes.toFixed(1)} min`;
}

export function formatTrendTime(time) {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return time;
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function elapsedMinutes(isoDate) {
  const started = new Date(isoDate).getTime();
  if (Number.isNaN(started)) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - started) / 60000));
}

export function waitLabel(isoDate) {
  if (!isoDate) {
    return 'Waiting';
  }

  const minutes = elapsedMinutes(isoDate);
  if (minutes === null) {
    return 'Waiting';
  }
  if (minutes < 1) {
    return 'Just joined';
  }
  if (minutes < 60) {
    return `${minutes} min wait`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m wait`;
}

export function startedLabel(isoDate) {
  if (!isoDate) {
    return 'Service just started';
  }

  const minutes = elapsedMinutes(isoDate);
  if (minutes === null || minutes < 1) {
    return 'Service just started';
  }
  if (minutes < 60) {
    return `Serving for ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `Serving for ${hours}h ${remaining}m`;
}

export function chartPoints(trend = []) {
  return trend.map((point) => ({
    time: formatTrendTime(point.time),
    queueLength: point.queueLength,
  }));
}

export function formatClock(time) {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(time) {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ticket(number) {
  return `#${String(number ?? 0).padStart(3, '0')}`;
}

export function percent(part, total) {
  if (!total) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function todayLabel() {
  return new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}
