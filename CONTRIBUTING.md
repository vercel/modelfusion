# Contributing to ModelFusion

Feedback, bug reports and other contributions are welcome.

## Getting Started

> Pre-requisite: you have installed [git][install-git], [node][install-node] and [pnpm][install-pnpm].

1. Clone the ModelFusion repository: `git clone https://github.com/lgrammel/modelfusion.git``
2. Go into the cloned repository: `cd modelfusion`
3. Install dependencies: `pnpm install`
4. Setup pre-commit hook: `pnpm run setup`. The precommit hook will format your changes ModelFusion each time you commit.
5. Build: `pnpm build`

## Build

```sh
pnpm build
```

## Watch Mode for Local Development

When running the `pnpm install` command, pnpm will both install all dependencies within the monorepo and symlink dependant workspaces to one another (specifically symlinking the compiled output in each workspace's `dist` folder). Therefore, if you are working on a specific package (e.g., `packages/modelfusion`) and you want your changes to be reflected in the consuming package (e.g., `examples/basic`), you can run `pnpm build:watch` from the monorepo's root directory.

<!-- Links -->

[install-git]: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
[install-node]: https://nodejs.org/en/download/
[install-pnpm]: https://pnpm.io/
