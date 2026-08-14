import * as Sentry from "@sentry/node";
import { defineConfig } from "@trigger.dev/sdk/v3";

// Initialize Sentry for error tracking in Trigger.dev tasks
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "production",
    tracesSampleRate: 0.1,
  });
}

export default defineConfig({
  // Get this from the Trigger.dev dashboard (Settings > Project ID)
  project: "proj_cwnghmfykpislsxcmxtl",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300, // 5 minutes (in seconds)
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
  dirs: ["./src/tasks"],

  // Global failure handler - captures all task errors in Sentry
  onFailure: async ({ error, ctx }) => {
    if (!process.env.SENTRY_DSN) return;

    try {
      Sentry.withScope((scope) => {
        scope.setTag("taskId", ctx.task.id);
        scope.setTag("runId", ctx.run.id);
        Sentry.captureException(error);
      });

      // Flush events before task completes
      await Sentry.flush(2000);
    } catch (sentryError) {
      // Don't let Sentry errors interfere with Trigger.dev's failure processing
      console.error("[Sentry] Failed to capture task error:", sentryError);
    }
  },
});
