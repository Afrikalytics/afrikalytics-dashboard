import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testPathIgnorePatterns: [
    "<rootDir>/e2e/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/helpers.ts",
  ],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 45,
      lines: 50,
    },
  },
};

export default createJestConfig(config);
