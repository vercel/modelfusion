import { z } from "zod";
import { zodSchema } from "../../core/schema/ZodSchema";
import { streamObject } from "../../model-function/generate-object/streamObject";
import { streamText } from "../../model-function/generate-text/streamText";
import { StreamingTestServer } from "../../test/StreamingTestServer";
import { arrayFromAsync } from "../../test/arrayFromAsync";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration";
import { OpenAIChatModel } from "./OpenAIChatModel";

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

describe("streamObject", () => {
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

    const stream = await streamObject({
      model: new OpenAIChatModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo",
      })
        .asFunctionCallObjectGenerationModel({
          fnName: "generateCharacter",
          fnDescription: "Generate character descriptions.",
        })
        .withTextPrompt(),
      schema: zodSchema(z.object({ name: z.string() })),
      prompt: "generate a name",
    });

    const streamAsArray = await arrayFromAsync(stream);

    expect(streamAsArray.map((entry) => entry.partialObject)).toStrictEqual([
      {},
      { name: "" },
      { name: "M" },
      { name: "Mike" },
      { name: "Mike" }, // double occurrence on purpose (stream text)
    ]);
  });
});
