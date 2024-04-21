/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { defineConfig } from "cypress";
import webpackPreprocessorBatteries from "@cypress/webpack-batteries-included-preprocessor";
import type webpackPreprocessor from "@cypress/webpack-preprocessor";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on) {
      const options =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        webpackPreprocessorBatteries.defaultOptions as typeof webpackPreprocessor.defaultOptions;
      options.webpackOptions = {
        ...options.webpackOptions,
        experiments: {
          ...options.webpackOptions?.experiments,
          asyncWebAssembly: true,
        },
      };
      options.typescript = require.resolve("typescript");
      on("file:preprocessor", webpackPreprocessorBatteries(options));
    },
  },
});
