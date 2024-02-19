# Contributing to ModelFusion

Feedback, bug reports and other contributions are welcome.

## Getting Started

> Pre-requisite: you have installed [git][install-git], [node][install-node] and [pnpm][install-pnpm].

1. Clone the ModelFusion repository: `git clone https://github.com/lgrammel/modelfusion.git`
2. Go into the cloned repository: `cd modelfusion`
3. Install dependencies: `pnpm install`
4. Setup pre-commit hook: `pnpm run setup` (not `pnpm setup`). The precommit hook will format your changes ModelFusion each time you commit.
5. Build: `pnpm build`

## Build

```sh
pnpm build
```

## Generate TypeScript declaration maps (.d.ts.map)

ModelFusion is a monorepo consisting of many workspaces. When developing in the workspaces in `packages/*` and `tools/*`, you will want to enable TypeScript declaration maps (`.d.ts.map`). TypeScript declaration maps are mainly used to quickly jump to type definitions in the context of a monorepo (see [source issue](https://github.com/Microsoft/TypeScript/issues/14479) and [official documentation](https://www.typescriptlang.org/tsconfig/#declarationMap)). To enable TypeScript declaration maps, run the following:

```sh
pnpm build:dtsMap
```

With the TypeScript declaration maps created, you now can navigate to source `.ts` files more easily in your IDE. For example, consider the following:

```ts
// file: examples/basic/src/model-function/generate-text-example.ts
import { generateText, openai } from "modelfusion";
```

In the above code snippet, you may be in VS Code and want to navigate to the source `.ts` file where `openai` is implemented. Without TypeScript declaration maps created, when you attempt to navigate to the source file for the imported `openai`, your IDE will open the compiled `.d.ts` file (`packages/modelfusion/dist/index.d.ts`). However, once you generate the TypeScript declaration maps, your IDE should now open the source `.ts` file (e.g., `packages/modelfusion/src/model-provider/openai/OpenAIFacade.ts`).

## Watch Mode

In addition to generating TypeScript declaration maps, you will want to recomplie your changes in real-time so that your changes are immediately available to the consuming packages in the monorepo. To do this, you can run the following:

```sh
cd packages/modelfusion # or whichever workspace you are developing in
pnpm dev
```

The `pnpm dev` script will watch for changes in the specified workspace, recompile the changes, and produce updated TypeScript declaration maps.

<!-- Links -->

[install-git]: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
[install-node]: https://nodejs.org/en/download/
[install-pnpm]: https://pnpm.io/
