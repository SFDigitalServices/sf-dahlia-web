import type { StorybookConfig } from "@storybook/react-webpack5"

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.ts"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  staticDirs: ["../public"],
//   webpackFinal: async (config) => {
//     config.output.publicPath = "/storybook/"
//     return config
//   },
}
export default config
