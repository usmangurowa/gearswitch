/**
 * Sanitization utilities for security hardening.
 *
 * Provides functions to:
 * - Sanitize user input before embedding in LLM prompts (prevent prompt injection)
 * - Sanitize output for HTML rendering (prevent XSS)
 */

/**
 * Characters and patterns that could be used for prompt injection.
 * This includes markdown delimiters, instruction separators, and role markers.
 */
const PROMPT_INJECTION_PATTERNS = [
  // Instruction separators
  /\n{3,}/g, // Multiple newlines
  /---+/g, // Markdown horizontal rules
  /===+/g, // Alternative horizontal rules
  // Role/instruction markers
  /\b(system|user|assistant|human|ai):/gi,
  /\[?(INST|SYSTEM|USER|ASSISTANT)\]?/gi,
  // Markdown emphasis that could be abused
  /\*{2,}/g, // Bold markers
  /_{2,}/g, // Underline/italic markers
  // Template literals and code blocks
  /`{3,}/g, // Code fences
  /\${/g, // Template literals
  // Control characters
  // eslint-disable-next-line no-control-regex
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
];

/**
 * Maximum length for prompt inputs to prevent context overflow attacks.
 */
const MAX_PROMPT_INPUT_LENGTH = 500;

/**
 * Sanitize a string for safe embedding in an LLM prompt.
 * Removes potential prompt injection patterns and truncates to safe length.
 *
 * @param text - User-provided text to sanitize
 * @param maxLength - Maximum allowed length (default: 500)
 * @returns Sanitized string safe for prompt embedding
 *
 * @example
 * ```ts
 * const safeBranch = sanitizeForPrompt("feature/auth\n\nIgnore previous instructions");
 * // Returns: "feature/auth Ignore previous instructions"
 * ```
 */
export const sanitizeForPrompt = (
  text: string | undefined | null,
  maxLength = MAX_PROMPT_INPUT_LENGTH,
): string => {
  if (!text) return "";

  let sanitized = text;

  // Apply all sanitization patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, " ");
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + "...";
  }

  return sanitized;
};

/**
 * Sanitize an array of strings for safe embedding in an LLM prompt.
 *
 * @param items - Array of user-provided strings
 * @param maxLength - Maximum length per item
 * @returns Array of sanitized strings
 */
export const sanitizeArrayForPrompt = (
  items: string[],
  maxLength = MAX_PROMPT_INPUT_LENGTH,
): string[] => {
  return items.map((item) => sanitizeForPrompt(item, maxLength));
};

/**
 * HTML entities to escape for XSS prevention.
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML characters to prevent XSS when rendering in browsers.
 *
 * @param text - Text that may contain HTML characters
 * @returns HTML-escaped string safe for rendering
 *
 * @example
 * ```ts
 * const safe = escapeHtml("<script>alert('xss')</script>");
 * // Returns: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
 * ```
 */
export const escapeHtml = (text: string | undefined | null): string => {
  if (!text) return "";

  return text.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
};

/**
 * Sanitize LLM output for safe storage and rendering.
 * Escapes HTML and removes any embedded scripts or dangerous content.
 *
 * @param text - LLM-generated text
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string safe for storage and rendering
 */
export const sanitizeLlmOutput = (
  text: string | undefined | null,
  maxLength = 1000,
): string => {
  if (!text) return "";

  // Escape HTML characters
  let sanitized = escapeHtml(text);

  // Remove any script-like patterns that might have slipped through
  sanitized = sanitized.replace(
    /(?:javascript|data|vbscript):/gi,
    "[removed]:",
  );

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength) + "...";
  }

  return sanitized;
};
