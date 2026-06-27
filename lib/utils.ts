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

export function createEmployeeAvatar(firstName: string, lastName: string, id = ''): string {
  const name = `${firstName} ${lastName}`.trim();
  const seed = `${name}${id}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const skin = '#F4E4C8';
  const backgroundColors = [
    '#E76F61',
    '#F08A8A',
    '#F4A261',
    '#D8A028',
    '#E9C46A',
    '#A7C957',
    '#7DD3C7',
    '#2FAE9B',
    '#8BD3C7',
    '#5B8FA8',
    '#A7C7E7',
    '#93C5FD',
    '#94A3B8',
    '#C4B5FD',
    '#F0ABFC',
    '#F9A8D4',
    '#FDBA74',
    '#BFD7B5'
  ];
  const hairColors = ['#171717', '#2B211E', '#3A2A22', '#51413A', '#6B7280'];
  const outfitColors = ['#1E293B', '#2F4858', '#315A6E', '#7A2E3A', '#0F766E', '#A1492E', '#334155'];
  const shirtColors = ['#F8F3E8', '#E7F0F2', '#F3E8D4', '#E8EEF7'];
  const tieColors = ['#B91C1C', '#1D4ED8', '#0F766E', '#B45309'];
  const safeHash = Math.abs(hash);
  const normalizedFirstName = firstName.trim().toLowerCase();
  const feminineNames = new Set(['anna', 'emily', 'jane', 'lisa', 'maya', 'rachel', 'sarah']);
  const masculineNames = new Set(['alex', 'bob', 'chris', 'david', 'john', 'kevin', 'mike', 'tom']);
  const presentation = feminineNames.has(normalizedFirstName)
    ? 'feminine'
    : masculineNames.has(normalizedFirstName)
      ? 'masculine'
      : 'neutral';
  const background = backgroundColors[safeHash % backgroundColors.length];
  const hair = hairColors[Math.floor(safeHash / 3) % hairColors.length];
  const outfit = outfitColors[Math.floor(safeHash / 5) % outfitColors.length];
  const shirt = shirtColors[Math.floor(safeHash / 7) % shirtColors.length];
  const tie = tieColors[Math.floor(safeHash / 11) % tieColors.length];
  const masculineHairStyles = [0, 2, 5];
  const feminineHairStyles = [1, 3, 4];
  const neutralHairStyles = [0, 1, 2, 3, 4, 5];
  const hairStylePool = presentation === 'feminine'
    ? feminineHairStyles
    : presentation === 'masculine'
      ? masculineHairStyles
      : neutralHairStyles;
  const hairStyle = hairStylePool[Math.floor(safeHash / 17) % hairStylePool.length];
  const outfitStyle = Math.floor(safeHash / 13) % 3;
  const hasGlasses = safeHash % 5 === 0;

  const hairShape = [
    '<path d="M39 63c0-25 10-39 27-39s28 14 28 39c-8-14-18-21-31-21-10 0-18 7-24 21Z" fill="' + hair + '"/><path d="M41 48c8-14 20-20 35-15 8 3 14 9 18 18-18-9-35-10-53-3Z" fill="' + hair + '"/>',
    '<path d="M32 94c1-47 13-70 34-70s33 23 34 70c-11-15-18-33-20-53-10-6-21-6-32 0-2 20-7 38-16 53Z" fill="' + hair + '"/><path d="M41 50c8-14 20-20 35-15 8 3 14 9 18 18-18-9-35-10-53-3Z" fill="' + hair + '"/>',
    '<path d="M37 59c4-23 14-35 29-35s26 12 30 35c-10-11-21-17-33-17-10 0-19 6-26 17Z" fill="' + hair + '"/><path d="M41 46c10-13 22-17 37-11 7 3 13 9 17 18-18-10-36-12-54-7Z" fill="' + hair + '"/>',
    '<circle cx="64" cy="26" r="12" fill="' + hair + '"/><path d="M35 64c2-26 13-40 31-40s29 14 31 40c-9-14-19-22-32-22-12 0-22 8-30 22Z" fill="' + hair + '"/><path d="M42 48c8-13 20-18 34-13 8 3 14 9 18 18-17-9-34-10-52-5Z" fill="' + hair + '"/>',
    '<path d="M34 94c2-45 13-67 32-67s30 22 32 67c-9-15-16-32-19-53-9-5-19-5-30 0-2 20-7 38-15 53Z" fill="' + hair + '"/><circle cx="91" cy="58" r="10" fill="' + hair + '"/><path d="M41 49c9-14 21-19 36-14 8 3 14 9 18 18-18-9-36-11-54-4Z" fill="' + hair + '"/>',
    '<path d="M38 64c3-26 14-40 30-40 15 0 26 13 29 39-9-13-19-21-32-21-11 0-20 8-27 22Z" fill="' + hair + '"/><path d="M35 67c-6-17-1-31 13-40 0 19-4 33-13 40Z" fill="' + hair + '"/><path d="M41 47c9-13 21-18 35-13 8 3 14 9 18 18-18-9-35-10-53-5Z" fill="' + hair + '"/>'
  ][hairStyle];

  const glasses = hasGlasses
    ? '<circle cx="54" cy="61" r="7" fill="none" stroke="#334155" stroke-width="3"/><circle cx="74" cy="61" r="7" fill="none" stroke="#334155" stroke-width="3"/><rect x="61" y="60" width="6" height="3" fill="#334155"/>'
    : '';

  const outfitShape = [
    '<path d="M18 128c5-30 23-46 46-46s41 16 46 46H18Z" fill="' + outfit + '"/><path d="M47 86h34l-17 30-17-30Z" fill="' + shirt + '"/><path d="M60 90h8l4 25-8 10-8-10 4-25Z" fill="' + tie + '"/>',
    '<path d="M18 128c6-29 23-45 46-45s40 16 46 45H18Z" fill="' + outfit + '"/><path d="M42 87l22 25 22-25v41H42V87Z" fill="' + shirt + '"/>',
    '<path d="M20 128c7-28 23-43 44-43s37 15 44 43H20Z" fill="' + outfit + '"/><path d="M47 88c7 8 27 8 34 0v40H47V88Z" fill="' + shirt + '"/>'
  ][outfitStyle];

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${name}">
  <circle cx="64" cy="64" r="62" fill="${background}"/>
  ${outfitShape}
  <ellipse cx="64" cy="62" rx="23" ry="27" fill="${skin}"/>
  ${hairShape}
  ${glasses}
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
