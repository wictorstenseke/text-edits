/** Max length for a single tag value (e.g. company name, org number). */
const MAX_TAG_VALUE_LENGTH = 500;

/**
 * Sanitizes a single tag value: strips control chars and truncates to max length.
 */
export function sanitizeTagValue(value: string): string {
  if (typeof value !== "string") return "";
  const stripped = value
    .split("")
    .filter((c) => {
      const code = c.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
  return stripped.slice(0, MAX_TAG_VALUE_LENGTH);
}

/**
 * Sanitizes all values in a tagValues record.
 */
export function sanitizeTagValues(
  tagValues: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(tagValues)) {
    if (typeof key === "string" && key.length > 0) {
      result[key] = sanitizeTagValue(value);
    }
  }
  return result;
}
