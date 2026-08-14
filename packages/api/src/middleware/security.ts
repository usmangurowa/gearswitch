import type { MiddlewareHandler } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";

import type { AppContext } from "../context";

/**
 * Security configuration options
 */
export interface SecurityConfig {
  /** Allowed origins for CORS (default: ["*"]) */
  allowedOrigins?: string[];
  /** Rate limit: max requests per window (default: 100) */
  rateLimit?: number;
  /** Rate limit window in milliseconds (default: 60000 = 1 minute) */
  rateLimitWindow?: number;
  /** Enable CSRF protection (default: true for non-GET requests) */
  enableCsrf?: boolean;
  /** Paths to exclude from rate limiting (e.g., health checks) */
  rateLimitExcludePaths?: string[];
}

const defaultConfig: Required<SecurityConfig> = {
  allowedOrigins: ["*"],
  rateLimit: 100,
  rateLimitWindow: 60 * 1000, // 1 minute
  enableCsrf: true,
  rateLimitExcludePaths: ["/health"],
};

/**
 * Secure Headers Middleware
 * Adds security headers like X-Frame-Options, X-Content-Type-Options, etc.
 * Similar to Helmet.js for Express
 */
export const secureHeadersMiddleware = (): MiddlewareHandler<AppContext> => {
  return secureHeaders({
    // Prevent clickjacking attacks
    xFrameOptions: "DENY",
    // Prevent MIME type sniffing
    xContentTypeOptions: "nosniff",
    // Enable XSS filter in browsers
    xXssProtection: "1; mode=block",
    // Control referrer information
    referrerPolicy: "strict-origin-when-cross-origin",
    // Strict Transport Security (HSTS)
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    // Prevent content from being loaded in Adobe products
    xPermittedCrossDomainPolicies: "none",
    // Download options - prevent IE from executing downloads
    xDownloadOptions: "noopen",
  });
};

/**
 * CORS Middleware
 * Configures Cross-Origin Resource Sharing
 */
export const corsMiddleware = (
  config: SecurityConfig = {},
): MiddlewareHandler<AppContext> => {
  const mergedConfig = { ...defaultConfig, ...config };

  return cors({
    origin: mergedConfig.allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["X-Request-Id", "X-Response-Time"],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
};

/**
 * Rate Limiting Middleware
 * Limits the number of requests per IP address
 */
export const rateLimitMiddleware = (
  config: SecurityConfig = {},
): MiddlewareHandler<AppContext> => {
  const mergedConfig = { ...defaultConfig, ...config };

  return rateLimiter({
    windowMs: mergedConfig.rateLimitWindow,
    limit: mergedConfig.rateLimit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      // If API key is present, use it as the rate limit key
      // This gives each authenticated user their own rate limit bucket
      const apiKey =
        c.req.header("x-api-key") ??
        c.req.header("authorization")?.replace("Bearer ", "");
      if (apiKey) {
        return `apikey:${apiKey}`;
      }

      // For unauthenticated requests, use IP-based rate limiting
      const forwarded = c.req.header("x-forwarded-for");
      if (forwarded) {
        return `ip:${forwarded.split(",")[0]?.trim() ?? "unknown"}`;
      }
      return `ip:${c.req.header("x-real-ip") ?? "unknown"}`;
    },
    // Skip rate limiting for excluded paths
    skip: (c) => {
      const path = c.req.path;
      return mergedConfig.rateLimitExcludePaths.some((excludePath) =>
        path.startsWith(excludePath),
      );
    },
  });
};

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */
export const csrfMiddleware = (
  config: SecurityConfig = {},
): MiddlewareHandler<AppContext> => {
  const mergedConfig = { ...defaultConfig, ...config };

  if (!mergedConfig.enableCsrf) {
    return async (c, next) => {
      await next();
    };
  }

  return csrf({
    origin: mergedConfig.allowedOrigins.includes("*")
      ? undefined // Allow all origins if wildcard
      : mergedConfig.allowedOrigins,
  });
};

/**
 * Combined security middleware that applies all security features
 * @param config - Security configuration options
 */
export const createSecurityMiddleware = (config: SecurityConfig = {}) => {
  return {
    secureHeaders: secureHeadersMiddleware(),
    cors: corsMiddleware(config),
    rateLimit: rateLimitMiddleware(config),
    csrf: csrfMiddleware(config),
  };
};

export type { SecurityConfig as SecurityOptions };
