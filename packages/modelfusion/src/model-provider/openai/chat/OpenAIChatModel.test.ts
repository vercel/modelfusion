import { streamText } from "../../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../../test/arrayFromAsync.js";
import { OpenAIApiConfiguration } from "../OpenAIApiConfiguration.js";
import { OpenAIChatModel } from "./OpenAIChatModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer(
    "https://api.openai.com/v1/chat/completions"
  );

  server.setupTestEnvironment();

  it("should return only values from the first choice when using streamText", async () => {
    server.responseChunks = [
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{"content":"A"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{"content":"B"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{},"finish_reason":"stop"}]}\n\n`,
      "data: [DONE]\n\n",
    ];

    const stream = await streamText(
      new OpenAIChatModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo",
        numberOfGenerations: 2,
      }).withTextPrompt(),
      "test prompt"
    );

    expect(await arrayFromAsync(stream)).toStrictEqual(["A"]);
  });
});
