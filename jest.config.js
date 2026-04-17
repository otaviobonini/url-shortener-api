import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Aponta para o tsconfig específico de testes
        tsconfig: "./tsconfig.test.json",
      },
    ],
  },
  moduleNameMapper: {
    // Remove o .js dos imports para o Jest conseguir resolver
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
