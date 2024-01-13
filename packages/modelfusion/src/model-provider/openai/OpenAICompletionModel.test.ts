import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { OpenAIApiConfiguration } from "./OpenAIApiConfiguration.js";
import { OpenAICompletionModel } from "./OpenAICompletionModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer(
    "https://api.openai.com/v1/completions"
  );

  server.setupTestEnvironment();

  it("should return only values from the first choice when using streamText", async () => {
    server.responseChunks = [
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"Hello","index":0,"logprobs":null,"finish_reason":null}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":", ","index":0,"logprobs":null,"finish_reason":null}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"world!","index":0,"logprobs":null,"finish_reason":null}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"","index":0,"logprobs":null,"finish_reason":"length"}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      "data: [DONE]\n\n",
    ];

    const stream = await streamText({
      model: new OpenAICompletionModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo-instruct",
      }),
      prompt: "hello",
    });

    // note: space moved to last chunk bc of trimming
    expect(await arrayFromAsync(stream)).toStrictEqual([
      "Hello",
      ",",
      " world!",
    ]);
  });

  it("should return only values from the first choice when using streamText", async () => {
    server.responseChunks = [
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"A","index":0,"logprobs":null,"finish_reason":null}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"B","index":1,"logprobs":null,"finish_reason":null}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"","index":0,"logprobs":null,"finish_reason":"length"}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      `data: {"id":"cmpl-8ZNls6dH7X2jUAJbY5joSWF9L0AD3","object":"text_completion","created":1703443548,` +
        `"choices":[{"text":"","index":1,"logprobs":null,"finish_reason":"length"}],"model":"gpt-3.5-turbo-instruct"}\n\n`,
      "data: [DONE]\n\n",
    ];

    const stream = await streamText({
      model: new OpenAICompletionModel({
        api: new OpenAIApiConfiguration({ apiKey: "test-key" }),
        model: "gpt-3.5-turbo-instruct",
        numberOfGenerations: 2,
      }),
      prompt: "test prompt",
    });

    expect(await arrayFromAsync(stream)).toStrictEqual(["A"]);
  });
});
