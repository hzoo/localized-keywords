import * as Babel from "@babel/core";
import json5 from "json5";

// take from @babel/standalone
import {
  presets as availablePresets,
  plugins as availablePlugins
} from "./plugins-list";

export function transpilePlugin(pluginString) {
  return Babel.transform(pluginString, {
    babelrc: false,
    configFile: false,
    ast: false,
    highlightCode: false,
    presets: [availablePresets["@babel/preset-env"]]
  }).code;
}

// astexplorer
export default function compileModule(code, globals = {}) {
  let exports = {};
  let module = { exports };
  let globalNames = Object.keys(globals);
  let keys = ["module", "exports", ...globalNames];
  let values = [module, exports, ...globalNames.map(key => globals[key])];
  // eslint-disable-next-line no-new-func
  new Function(keys.join(), code).apply(exports, values);
  return module.exports;
}

export function loadBuiltin(builtinTable, name) {
  if (Array.isArray(name) && typeof name[0] === "string") {
    if (Object.prototype.hasOwnProperty.call(builtinTable, name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }
    return;
  } else if (typeof name === "string") {
    return builtinTable[name];
  }
  // Could be an actual preset/plugin module
  return name;
}

export function processOptions(options, customPlugin) {
  if (typeof options === "string") options = json5.parse(options);

  // Parse preset names
  const presets = (options.presets || []).map(presetName => {
    const preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      // workaround for babel issue
      // at some point, babel copies the preset, losing the non-enumerable
      // buildPreset key; convert it into an enumerable key.
      if (
        Array.isArray(preset) &&
        typeof preset[0] === "object" &&
        Object.prototype.hasOwnProperty.call(preset[0], "buildPreset")
      ) {
        preset[0] = { ...preset[0], buildPreset: preset[0].buildPreset };
      }
    } else {
      throw new Error(
        `Invalid preset specified in Babel options: "${presetName}"`
      );
    }
    return preset;
  });

  // Parse plugin names
  const plugins = (options.plugins || []).map(pluginName => {
    const plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error(
        `Invalid plugin specified in Babel options: "${pluginName}"`
      );
    }
    return plugin;
  });

  if (customPlugin) {
    customPlugin = transpilePlugin(customPlugin);
    plugins.unshift(compileModule(customPlugin));
  }

  return {
    sourceType: "module",
    babelrc: false,
    configFile: false,
    retainLines: true,
    ...options,
    parserOpts: {
      ...options.parserOpts,
      emoji: true, // new option
      plugins: [
        "asyncGenerators",
        "bigInt",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        ["decorators", { decoratorsBeforeExport: false }],
        "doExpressions",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "functionBind",
        "functionSent",
        "importMeta",
        "logicalAssignment",
        "nullishCoalescingOperator",
        "numericSeparator",
        "objectRestSpread",
        "optionalCatchBinding",
        "optionalChaining",
        "partialApplication",
        ["pipelineOperator", { proposal: "minimal" }],
        "throwExpressions",
        "topLevelAwait",
        "jsx"
      ]
    },
    presets,
    plugins
  };
}
