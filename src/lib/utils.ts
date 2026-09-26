import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | number): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getTimeAgo(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "moving":
    case "on route":
    case "board_ed":
    case "arrived_school":
      return "text-green-600 bg-green-50 border-green-200";
    case "delayed":
    case "on_break":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "emergency":
    case "offline":
      return "text-red-600 bg-red-50 border-red-200";
    case "stopped":
    case "inactive":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
}

export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "moving":
    case "on route":
      return "🟢";
    case "delayed":
      return "🟡";
    case "emergency":
      return "🔴";
    case "offline":
      return "⚫";
    case "stopped":
      return "🛑";
    default:
      return "🔵";
  }
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}
