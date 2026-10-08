module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    ["transform-inline-environment-variables", { include: ["LUMINE_API_BASE_URL"] }]
  ]
};
