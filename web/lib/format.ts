export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function formatMinutes(value: number) {
  return `${Math.round(value)} min`;
}

export function formatDistanceKm(value: number) {
  return `${value.toFixed(1)} km`;
}

export function formatHours(value: number) {
  return `${value.toFixed(1)} hrs`;
}
