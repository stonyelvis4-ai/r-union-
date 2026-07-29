/** Simple sanitization: trim strings, limit length to reduce injection risk */
export function sanitizeString(input: unknown, maxLength = 2000): string {
  if (input == null) return '';
  const s = String(input).trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}

export function sanitizeOptionalString(input: unknown, maxLength = 2000): string | null {
  if (input == null || input === '') return null;
  const s = String(input).trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}
