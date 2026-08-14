import { Hono } from "hono";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

const app = new Hono<AppContext>()
  .get("/session", (c) => {
    const session = c.get("session");
    return c.json(session);
  })
  .get("/secret", authMiddleware, (c) => {
    return c.json({ message: "you can see this secret message!" });
  });

export default app;
