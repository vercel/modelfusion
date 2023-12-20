# Contributing to ModelFusion

Feedback, bug reports and other contributions are welcome.

## Getting Started

> Pre-requisite: you have installed [git][install-git], [node][install-node] and [pnpm][install-pnpm].

1. Clone the ModelFusion repository: `git clone https://github.com/lgrammel/modelfusion.git``
2. Go into the cloned repository: `cd modelfusion`
3. Install dependencies: `npm install`
4. Setup pre-commit hook: `npm setup`. The precommit hook will lint, format, build and test ModelFusion each time you commit.
5. Build: `npm run build`

## Linking for examples

In ModelFusion's root directory:

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

## Publishing

```sh
npm run dist
cd dist
npm publish
cd ..
```

<!-- Links -->

[install-git]: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
[install-node]: https://nodejs.org/en/download/
[install-pnpm]: https://pnpm.io/
