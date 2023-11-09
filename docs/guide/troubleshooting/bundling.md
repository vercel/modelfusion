# Bundling

## Error: node:async_hooks is not available in the browser

You may encounter this error when bundling your application with Webpack or Next.js:

```
Failed to compile.

node:async_hooks
Module build failed: UnhandledSchemeError: Reading from "node:async_hooks" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.
    at ...

Import trace for requested module:
node:async_hooks
../modelfusion/dist/core/getRun.js
../modelfusion/dist/core/index.js
../modelfusion/dist/index.js
```

This is because the `async_hooks` module is not available in the browser. You can configure Webpack to ignore this module by adding the following to your Webpack configuration (e.g. in `next.config.js`):

```js
module.exports = {
  output: "export",

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^node:async_hooks$/ })
      );
    }
    return config;
  },
};
```
