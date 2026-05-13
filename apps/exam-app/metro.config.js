// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const _ = require("lodash");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = _.uniq(
  config.resolver.unstable_conditionNames.concat(
    "browser",
    "require",
    "react-native",
  ),
);

module.exports = config;
