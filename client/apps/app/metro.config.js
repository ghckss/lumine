const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [path.resolve(workspaceRoot, "packages")],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],
  },
});
