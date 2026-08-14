"use client";

import { useIdentifyUser } from "@/hooks/use-identify-user";

/**
 * Component that identifies the user with Sentry and PostHog.
 * Must be rendered inside QueryClientProvider since it uses useSession.
 */
export const IdentifyUser = () => {
  useIdentifyUser();
  return null;
};
