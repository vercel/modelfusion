import { z } from "zod";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { streamStructure } from "../../model-function/generate-structure/streamStructure.js";
import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { OpenAIChatModel } from "./OpenAIChatModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer(
    "https://api.openai.com/v1/chat/completions"
  );

  server.setupTestEnvironment();

  it("should return only values from the first choice when using streamText", async () => {
    server.responseChunks = [
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":0,"delta":{"content":"A"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":1,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":1,"delta":{"content":"B"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613",` +
        `"system_fingerprint":null,"choices":[{"index":1,"delta":{},"finish_reason":"stop"}]}\n\n`,
      "data: [DONE]\n\n",
    ];

    const stream = await streamText({
      model: new OpenAIChatModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo",
        numberOfGenerations: 2,
      }).withTextPrompt(),
      prompt: "test prompt",
    });

    expect(await arrayFromAsync(stream)).toStrictEqual(["A"]);
  });
});

describe("streamStructure", () => {
  const server = new StreamingTestServer(
    "https://api.openai.com/v1/chat/completions"
  );

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"role":"assistant","content":null,` +
        `"function_call":{"name":"generateCharacter","arguments":""}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"{\\n"}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":" "}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":" \\""}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"name"}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"\\":\\""}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"M"}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"ike\\"\\n"}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{"function_call":{"arguments":"}"}},"logprobs":null,"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-8ZhZtizjTCGmZaPRwyUiuDJ1DYUD0","object":"chat.completion.chunk",` +
        `"created":1703519685,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,` +
        `"choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}\n\n`,
      `data: [DONE]\n\n`,
    ];

    const stream = await streamStructure({
      model: new OpenAIChatModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo",
      })
        .asFunctionCallStructureGenerationModel({
          fnName: "generateCharacter",
          fnDescription: "Generate character descriptions.",
        })
        .withTextPrompt(),
      schema: zodSchema(z.object({ name: z.string() })),
      prompt: "generate a name",
    });

    // note: space moved to last chunk bc of trimming
    expect(await arrayFromAsync(stream)).toStrictEqual([
      { isComplete: false, value: {} },
      { isComplete: false, value: { name: "" } },
      { isComplete: false, value: { name: "M" } },
      { isComplete: false, value: { name: "Mike" } },
      { isComplete: true, value: { name: "Mike" } },
    ]);
  });
});
