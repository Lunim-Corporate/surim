import type { Config } from "prismic-ts-codegen";

const config: Config = {
  output: "./prismicio-types.d.ts",
  models: ["./customtypes/**/index.json", "./slices/**/model.json"],
  repositoryName: "surim",
};

export default config;