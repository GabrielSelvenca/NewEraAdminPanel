/**
 * Sanitização de inputs para prevenir XSS e injection attacks
 */

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, '');
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    
    // Allow only http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

export function sanitizeNumeric(value: unknown): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

export function sanitizeInteger(value: unknown): number {
  return Math.floor(sanitizeNumeric(value));
}

export function sanitizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  allowedKeys.forEach(key => {
    if (key in obj) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value) as T[keyof T];
      } else if (typeof value === 'number') {
        sanitized[key] = sanitizeNumeric(value) as T[keyof T];
      } else if (typeof value === 'boolean') {
        sanitized[key] = sanitizeBoolean(value) as T[keyof T];
      }
    }
  });
  
  return sanitized;
}

export const sanitize = {
  string: sanitizeString,
  email: sanitizeEmail,
  url: sanitizeUrl,
  numeric: sanitizeNumeric,
  integer: sanitizeInteger,
  boolean: sanitizeBoolean,
  object: sanitizeObject,
};
