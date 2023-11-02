---
sidebar_position: 40
---

# Server

:::info

ModelFusion Server is in its initial development phase. The API is experimental and breaking changes are likely. Feedback and suggestions are welcome.

:::

ModelFusion provides a [Fastify](https://fastify.dev/) plugin that allows you to set up a server that exposes your ModelFusion flows as REST endpoints using server-sent events.

## Usage

### Server Setup

```ts
import {
  FileSystemAssetStorage,
  FileSystemLogger,
  modelFusionFastifyPlugin,
} from "modelfusion/fastify-server"; // '/fastify-server' import path

// configurable logging for all runs using ModelFusion observability:
const logger = new FileSystemLogger({
  path: (run) => path.join(fsBasePath, run.runId, "logs"),
});

// configurable storage for large files like images and audio files:
const assetStorage = new FileSystemAssetStorage({
  path: (run) => path.join(fsBasePath, run.runId, "assets"),
  logger,
});

fastify.register(modelFusionFastifyPlugin, {
  baseUrl,
  basePath: "/myFlow",
  logger,
  assetStorage,
  flow: exampleFlow,
});
```

### Call server from client

Using `invokeFlow`, you can easily connect your client to a ModelFusion flow endpoint:

```ts
import { invokeFlow } from "modelfusion/browser"; // '/browser' import path

invokeFlow({
  url: `${BASE_URL}/myFlow`,
  schema: duplexStreamingFlowSchema,
  input: { prompt },
  onEvent(event) {
    switch (event.type) {
      case "my-event": {
        // do something with the event
        break;
      }
      // more events...
    }
  },
  onStop() {
    // flow finished
  },
});
```
