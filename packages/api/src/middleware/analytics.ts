/**
 * Analytics middleware for PostHog server-side tracking.
 * Tracks API requests for monitoring usage patterns.
 */

import type { AnalyticsEvent } from "@turbo/analytics/events";
import { trackServerEvent } from "@turbo/analytics/server";

/**
 * Track an API event with user context.
 */
export const trackApiEvent = (
  userId: string,
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) => {
  trackServerEvent({
    distinctId: userId,
    event,
    properties: {
      ...properties,
      source: "api",
    },
  });
};
