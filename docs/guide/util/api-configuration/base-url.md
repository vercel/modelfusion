---
sidebar_position: 5
---

# Base URL

You can configure the base URL of an API configuration by passing the `baseUrl` option by either setting it to a string or by setting individual parts of the URL. This is useful when you want to use proxies or custom setups.

## Usage

### Setting the base URL as a string

Example for [Ollama](/integration/model-provider/ollama). The same approach works for other model providers.

```ts
import { ollama } from "modelfusion";

const api = ollama.Api({
  baseUrl: "http://localhost:11434",
});
```

### Setting the base URL parts

All parts are optional. This approach lets you change individual parts of the base URL easily, e.g. to use a different port.

Example for [Ollama](/integration/model-provider/ollama). The same approach works for other model providers.

```ts
import { ollama } from "modelfusion";

const api = ollama.Api({
  baseUrl: {
    // all parts are optional:
    protocol: "http",
    hostname: "localhost",
    port: "11434",
    path: "/",
  },
});
```
