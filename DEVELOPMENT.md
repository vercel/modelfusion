## Setup

1. Checkout repository
   ```sh
   git clone https://github.com/lgrammel/modelfusion.git
   ```
2. `cd modelfusion`
3. Install dependencies: `npm install`
4. Build: `npm run build`

## Linking for examples

```sh
npm run dist
cd dist
npm link
cd ..
```

Then under e.g. `examples/basic` to setup the example:

```sh
npm install
npm link modelfusion
```

## Build

```sh
npm run build
```

## Publish

```sh
npm run dist
cd dist
npm publish
cd ..
```
