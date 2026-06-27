/**
 * Shared utility functions for the WorkNest frontend.
 * Extracted from duplicated implementations across pages and components.
 */

/**
 * Generate a deterministic HSL color from a name string.
 * Used for avatar backgrounds throughout the app.
 */
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 65%, 55%)`;
}

/**
 * Convert an ISO timestamp string to a human-readable relative time string.
 * Examples: "3m ago", "2h ago", "5d ago"
 */
export function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
