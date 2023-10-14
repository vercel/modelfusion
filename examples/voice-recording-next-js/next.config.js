/** @type {import('next').NextConfig} */
const webpack = require("webpack");

module.exports = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^node:async_hooks$/ })
      );
    }
    return config;
  },
};
