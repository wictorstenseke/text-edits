/**
 * Validates href values to prevent XSS via javascript:, vbscript:, data: URIs.
 * Allows only http:, https:, mailto:, and relative paths.
 */
export function isValidHref(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Reject dangerous schemes
  if (/^(javascript|vbscript|data):/i.test(trimmed)) return false;
  // Allow http, https, mailto, and relative paths (starts with / or # or no scheme)
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^[/#]/.test(trimmed) ||
    !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  );
}
