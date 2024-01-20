# Bundling

## Error: Module not found: Can't resolve 'async_hooks'

You may encounter this error when bundling your application with Webpack or Next.js:

```
 X ../../packages/modelfusion/dist/core/getRun.js:12:36
Module not found: Can't resolve 'async_hooks'
  10 |     if (!runStorage) {
  11 |         // Note: using "async_hooks" instead of "node:async_hooks" to avoid webpack fallback problems.
> 12 |         const { AsyncLocalStorage } = await import("async_hooks");
     |                                    ^
  13 |         runStorage = new AsyncLocalStorage();
  14 |     }
  15 |     return Promise.resolve();
```

This is because the `async_hooks` module is not available in the browser. You can configure Webpack to ignore this module by adding the following to your Webpack configuration (e.g. in `next.config.js`):

```js
/** @type {import('next').NextConfig} */
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
```
