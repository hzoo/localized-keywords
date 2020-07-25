export const plugins = {};
export const presets = {};

// If you want to add custom plugins or presets, you can register them
// at plugins-list.js in dependencies

plugins[
  "@babel/plugin-external-helpers"
] = require("@babel/plugin-external-helpers");
presets["@babel/preset-env"] = require("@babel/preset-env");
