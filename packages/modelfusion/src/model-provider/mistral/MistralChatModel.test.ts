import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { MistralApiConfiguration } from "./MistralApiConfiguration.js";
import { MistralChatModel } from "./MistralChatModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer(
    "https://api.mistral.ai/v1/chat/completions"
  );

  server.setupTestEnvironment();

  describe("simple hello world stream", () => {
    beforeEach(() => {
      server.responseChunks = [
        `data: {"id": "cmpl-6c5f9bc8be6540cc9cc41c075f199e96", "model": "mistral-tiny", ` +
          `"choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": null}]}\n\n`,
        `data: {"id": "cmpl-6c5f9bc8be6540cc9cc41c075f199e96", "object": "chat.completion.chunk",` +
          `"created": 1703439030, "model": "mistral-tiny", "choices": [{"index": 0, ` +
          `"delta": {"role": null, "content": "Hello"}, "finish_reason": null}]}\n\n`,
        `data: {"id": "cmpl-6c5f9bc8be6540cc9cc41c075f199e96", "object": "chat.completion.chunk",` +
          `"created": 1703439030, "model": "mistral-tiny", "choices": [{"index": 0, ` +
          `"delta": {"role": null, "content": ", "}, "finish_reason": null}]}\n\n`,
        `data: {"id": "cmpl-6c5f9bc8be6540cc9cc41c075f199e96", "object": "chat.completion.chunk",` +
          `"created": 1703439030, "model": "mistral-tiny", "choices": [{"index": 0, ` +
          `"delta": {"role": null, "content": "world!"}, "finish_reason": null}]}\n\n`,
        `{"id": "cmpl-6c5f9bc8be6540cc9cc41c075f199e96", "object": "chat.completion.chunk",` +
          `"created": 1703439030, "model": "mistral-tiny", "choices": [{"index": 0, ` +
          `"delta": {"role": null, "content": ""}, "finish_reason": "stop"}]}\n\n`,
        `data: [DONE]\n\n`,
      ];
    });

    it("should return a text stream", async () => {
      const stream = await streamText({
        model: new MistralChatModel({
          api: new MistralApiConfiguration({ apiKey: "test-key" }),
          model: "mistral-tiny",
        }).withTextPrompt(),
        prompt: "hello",
      });

      // note: space moved to last chunk bc of trimming
      expect(await arrayFromAsync(stream)).toStrictEqual([
        "Hello",
        ",",
        " world!",
      ]);
    });

    it("should return text", async () => {
      const { text } = await streamText({
        model: new MistralChatModel({
          api: new MistralApiConfiguration({ apiKey: "test-key" }),
          model: "mistral-tiny",
        }).withTextPrompt(),
        prompt: "hello",
        fullResponse: true,
      });

      expect(await text).toStrictEqual("Hello, world!");
    });
  });
});
