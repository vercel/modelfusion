# ModelFusion Server

> [!WARNING]
> Experimental feature. API will change.

## Usage

### Fastify server with ModelFusion flow plugin

```ts
import {
  FileSystemAssetStorage,
  FileSystemLogger,
  modelFusionFlowPlugin,
} from "@modelfusion/server/fastify-plugin";
import Fastify from "fastify";
import path from "node:path";

// ...

export async function main() {
  const fastify = Fastify();

  const logger = new FileSystemLogger({
    path: (run) => path.join(basePath, run.runId, "logs"),
  });

  fastify.register(modelFusionFlowPlugin, {
    path: "/generate-story",
    flow: generateStoryFlow, // See StoryTeller for full example implementation of a flow
    logger,
    assetStorage: new FileSystemAssetStorage({
      path: (run) => path.join(basePath, run.runId, "assets"),
      logger,
    }),
  });

  await fastify.listen({ port, host });
}

main();
```

## Examples

### [StoryTeller](https://github.com/lgrammel/storyteller)

> _multi-modal_, _structure streaming_, _image generation_, _text to speech_, _speech to text_, _text generation_, _structure generation_, _embeddings_

StoryTeller is an exploratory web application that creates short audio stories for pre-school kids.
