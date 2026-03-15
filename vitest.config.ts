/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    singleThread: true,
    setupFiles: [
      "./vitest.setup.ts",
      "./node_modules/@hirosystems/clarinet-sdk/vitest-helpers/src/vitest.setup.ts"
    ],
    globals: true,
  },
});