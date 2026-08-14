import { createMiddleware } from "hono/factory";

import type { AppContext } from "../context";

/**
 * Auth middleware that ensures user is authenticated
 * Returns 401 if no valid session exists
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const session = c.get("session");
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
