---
sidebar_position: 3
---

# Function Observers

Observing model calls or tool executions can be useful for many reasons. You can for example use them for logging, to send functional call data to observability APIs, or to record function calls in your DB.

ModelFusion provides a simple way to observe function calls. [Function observers](/api/interfaces/FunctionObserver) are called when [function events](/api/modules#functionevent) occur. The supported functions are model calls and tool executions.

## Function Events

Function events have several standard properties, as well as event-specific properties. The standard properties are:

- `timestamp`: The timestamp of the event.
- `eventType`: The type of the event. Can be `started` or `finished`.
- `functionType`: The type of the function, for example, `text-generation`.
- `callId`: A unique ID for the function call.
- `functionId`: A unique ID for the function. Optional.
- `runId`: A unique ID for the run. Available when the function is called with a run.
- `sessionId`: A unique ID for the session. Available when the function is called with a run that has a session.
- `userId`: A unique ID for the user. Available when the function is called with a run that has a user.

Events with `eventType = 'started'` also have a `startTimestamp` property.

Events with `eventType = 'finished'` have the following additional properties:

- `startTimestamp`: The timestamp of the function start.
- `finishTimestamp`: The timestamp of function execution completion.
- `durationInMs`: The duration of the function execution in milliseconds.
- `result`: The result of the function execution.
  - `status`: Can be `success`, `error`or `abort`.
    - `success`: The function execution was successful. The output is usually available as part of the event.
    - `error`: The function execution failed. The error is available in the `error` property.
    - `abort`: The function execution was aborted.

In addition to these properties, specific events contain e.g. the settings or outputs that are relevant for their function type. You can access them in a type-safe manner by selecting (e.g. via `if` or `switch`) on the `functionType`, `eventType` and `result.status` properties.

## Usage

### FunctionObserver

[API](/api/interfaces/FunctionObserver)

`FunctionObserver` has a single method, `onFunctionEvent` that is called with a [FunctionEvent](/api/modules#functionevent) when it occurs. You can implement it to do whatever you want with the event.

#### Example: Custom function observer

```ts
const observer: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    // you could also switch on e.g. event.functionType
    switch (event.eventType) {
      case "started": {
        console.log(
          `[${event.timestamp.toISOString()}] ${event.callId} - ${
            event.functionType
          } ${event.eventType}`
        );
        break;
      }
      case "finished": {
        console.log(
          `[${event.timestamp.toISOString()}] ${event.callId} - ${
            event.functionType
          } ${event.eventType} in ${event.durationInMs}ms`
        );
        break;
      }
    }
  },
};
```

### Global function observers

[getGlobalFunctionObservers()](/api/modules/#getglobalfunctionobservers) | [setGlobalFunctionObservers()](/api/modules/#setglobalfunctionobservers)

You can set global function observers that are called for all function events.

#### Example

```ts
setGlobalFunctionObservers([observer]);

const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxCompletionTokens: 50,
  }),
  "Write a short story about a robot name Evo:\n\n"
);
```

### Function-scoped function observers

You can set function observers for specific functions in the function options.

#### Example

```ts
const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxCompletionTokens: 50,
  }),
  "Write a short story about a robot named Nox:\n\n",
  { observers: [observer] }
);
```

### Run-scoped function observers

You can set function observers for all functions calls with a run.

#### Example

```ts
const run = new DefaultRun({
  observers: [observer],
});

const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxCompletionTokens: 50,
  }),
  "Write a short story about a robot named Pam:\n\n",
  { run }
);
```

### Model-scoped function observers

You can set function observers for all functions calls that use a model instance.

#### Example

```ts
const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxCompletionTokens: 50,
    observers: [observer],
  }),
  "Write a short story about a robot name Bud:\n\n"
);
```
