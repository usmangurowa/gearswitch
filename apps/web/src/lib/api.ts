"use client";

import { env } from "@/env";
import { hc } from "hono/client";

import type { AppType } from "@turbo/api";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  return `http://localhost:3000`;
};

/**
 * Typed Hono client for client components
 * Usage: const res = await api.post.all.$get()
 */
export const api = hc<AppType>(getBaseUrl() + "/api");
