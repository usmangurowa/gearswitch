import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@turbo/eslint-config/base";
import { nextjsConfig } from "@turbo/eslint-config/nextjs";
import { reactConfig } from "@turbo/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
