import { streamText } from "../../model-function/generate-text/streamText";
import { generateText } from "../../model-function/generate-text/generateText";
import { StreamingTestServer } from "../../test/StreamingTestServer";
import { JsonTestServer } from "../../test/JsonTestServer";
import { arrayFromAsync } from "../../test/arrayFromAsync";
import { MiniMaxApiConfiguration } from "./MiniMaxApiConfiguration";
import { OpenAICompatibleChatModel } from "./OpenAICompatibleChatModel";

describe("MiniMaxApiConfiguration", () => {
  it("should set the correct base URL", () => {
    const api = new MiniMaxApiConfiguration({ apiKey: "test-key" });
    expect(api.assembleUrl("/chat/completions")).toBe(
      "https://api.minimax.io:443/v1/chat/completions"
    );
  });

  it("should set the correct provider name", () => {
    const api = new MiniMaxApiConfiguration({ apiKey: "test-key" });
    expect(api.provider).toBe("openaicompatible-minimax");
  });

  it("should allow custom base URL overrides", () => {
    const api = new MiniMaxApiConfiguration({
      apiKey: "test-key",
      baseUrl: { host: "custom.minimax.io" },
    });
    expect(api.assembleUrl("/chat/completions")).toBe(
      "https://custom.minimax.io:443/v1/chat/completions"
    );
  });
});

describe("MiniMax streamText", () => {
  const server = new StreamingTestServer(
    "https://api.minimax.io/v1/chat/completions"
  );

  server.setupTestEnvironment();

  describe("simple hello world stream", () => {
    beforeEach(() => {
      server.responseChunks = [
        `data: {"id":"chatcmpl-minimax-001","object":"chat.completion.chunk","created":1703439030,"model":"MiniMax-M2.5",` +
          `"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
        `data: {"id":"chatcmpl-minimax-001","object":"chat.completion.chunk","created":1703439030,"model":"MiniMax-M2.5",` +
          `"choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n`,
        `data: {"id":"chatcmpl-minimax-001","object":"chat.completion.chunk","created":1703439030,"model":"MiniMax-M2.5",` +
          `"choices":[{"index":0,"delta":{"content":", "},"finish_reason":null}]}\n\n`,
        `data: {"id":"chatcmpl-minimax-001","object":"chat.completion.chunk","created":1703439030,"model":"MiniMax-M2.5",` +
          `"choices":[{"index":0,"delta":{"content":"world!"},"finish_reason":null}]}\n\n`,
        `data: {"id":"chatcmpl-minimax-001","object":"chat.completion.chunk","created":1703439030,"model":"MiniMax-M2.5",` +
          `"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`,
        `data: [DONE]\n\n`,
      ];
    });

    it("should return a text stream", async () => {
      const stream = await streamText({
        model: new OpenAICompatibleChatModel({
          api: new MiniMaxApiConfiguration({ apiKey: "test-key" }),
          model: "MiniMax-M2.5",
        }).withTextPrompt(),
        prompt: "hello",
      });

      // note: space moved to next chunk due to trimming
      expect(await arrayFromAsync(stream)).toStrictEqual([
        "Hello",
        ",",
        " world!",
      ]);
    });

    it("should return full text", async () => {
      const { textPromise } = await streamText({
        model: new OpenAICompatibleChatModel({
          api: new MiniMaxApiConfiguration({ apiKey: "test-key" }),
          model: "MiniMax-M2.5",
        }).withTextPrompt(),
        prompt: "hello",
        fullResponse: true,
      });

      expect(await textPromise).toStrictEqual("Hello, world!");
    });
  });
});

describe("MiniMax generateText", () => {
  const server = new JsonTestServer(
    "https://api.minimax.io/v1/chat/completions"
  );

  server.setupTestEnvironment();

  it("should return generated text", async () => {
    server.responseBodyJson = {
      id: "chatcmpl-minimax-002",
      object: "chat.completion",
      created: 1703439030,
      model: "MiniMax-M2.5",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Hello, world!",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    const text = await generateText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration({ apiKey: "test-key" }),
        model: "MiniMax-M2.5",
      }).withTextPrompt(),
      prompt: "hello",
    });

    expect(text).toStrictEqual("Hello, world!");
  });

  it("should work with MiniMax-M2.7 model", async () => {
    server.responseBodyJson = {
      id: "chatcmpl-minimax-003",
      object: "chat.completion",
      created: 1703439030,
      model: "MiniMax-M2.7",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "I am MiniMax M2.7.",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 8,
        completion_tokens: 6,
        total_tokens: 14,
      },
    };

    const text = await generateText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration({ apiKey: "test-key" }),
        model: "MiniMax-M2.7",
      }).withTextPrompt(),
      prompt: "What model are you?",
    });

    expect(text).toStrictEqual("I am MiniMax M2.7.");
  });

  it("should work with temperature setting", async () => {
    server.responseBodyJson = {
      id: "chatcmpl-minimax-004",
      object: "chat.completion",
      created: 1703439030,
      model: "MiniMax-M2.5",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Creative response here.",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 12,
        completion_tokens: 4,
        total_tokens: 16,
      },
    };

    const text = await generateText({
      model: new OpenAICompatibleChatModel({
        api: new MiniMaxApiConfiguration({ apiKey: "test-key" }),
        model: "MiniMax-M2.5",
        temperature: 0.7,
      }).withTextPrompt(),
      prompt: "Be creative",
    });

    expect(text).toStrictEqual("Creative response here.");
  });
});
