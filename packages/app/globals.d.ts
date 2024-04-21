import type webpackPreprocessor from "@cypress/webpack-preprocessor";

declare module "@cypress/webpack-batteries-included-preprocessor" {
  export const defaultOptions: webpackPreprocessor.WebpackPreprocessor["defaultOptions"];
}
