/** @type {import('next').NextConfig} */
const webpack = require("webpack");

module.exports = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      return config;
    }

    config.resolve = config.resolve ?? {};
    config.resolve.fallback = config.resolve.fallback ?? {};
    // config.resolve.fallback.async_hooks = false;

    return config;
  },
};
