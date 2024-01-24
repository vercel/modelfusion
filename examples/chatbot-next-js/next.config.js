/** @type {import('next').NextConfig} */
const webpack = require("webpack");

module.exports = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        ...[new webpack.IgnorePlugin({ resourceRegExp: /^bufferutil$/ })],
        ...[new webpack.IgnorePlugin({ resourceRegExp: /^utf-8-validate$/ })]
      );

      return config;
    }

    config.resolve = config.resolve ?? {};
    config.resolve.fallback = config.resolve.fallback ?? {};

    // async hooks is not available in the browser:
    config.resolve.fallback.async_hooks = false;

    return config;
  },
};
