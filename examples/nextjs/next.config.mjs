/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      return config;
    }

    config.resolve = config.resolve ?? {};
    config.resolve.fallback = config.resolve.fallback ?? {};

    // async hooks is not available in the browser:
    config.resolve.fallback.async_hooks = false;

    return config;
  },
};

export default nextConfig;
