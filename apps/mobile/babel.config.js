/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache.forever();

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "transform-inline-environment-variables",
      [
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts",
          logTimings: true,
        },
      ],
      require.resolve("expo-router/babel"),
      require.resolve("react-native-reanimated/plugin"),
    ],
  };
};
