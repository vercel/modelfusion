import { fail } from "assert";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { retryNever } from "../../core/api/retryNever.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { streamText } from "../../model-function/generate-text/streamText.js";
import { JsonTestServer } from "../../test/JsonTestServer.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { OllamaCompletionModel } from "./OllamaCompletionModel.js";

describe("generateText", () => {
  const server = new JsonTestServer("http://127.0.0.1:11434/api/generate");

  server.setupTestEnvironment();

  it("should return the generated text", async () => {
    server.responseBodyJson = {
      model: "test-model",
      created_at: "2023-08-04T19:22:45.499127Z",
      response: "test response",
      context: [1, 2, 3],
      done: true,
      total_duration: 5589157167,
      load_duration: 3013701500,
      sample_count: 114,
      sample_duration: 81442000,
      prompt_eval_count: 46,
      prompt_eval_duration: 1160282000,
      eval_count: 113,
      eval_duration: 1325948000,
    };

    const result = await generateText(
      new OllamaCompletionModel({
        model: "test-model",
      }).withTextPrompt(),
      "test prompt"
    );

    expect(result).toEqual("test response");
  });

  it("should throw retryable ApiCallError when Ollama is overloaded", async () => {
    server.responseBodyJson = {
      model: "",
      created_at: "0001-01-01T00:00:00Z",
      response: "",
      done: false,
    };

    try {
      await generateText(
        new OllamaCompletionModel({
          api: new OllamaApiConfiguration({
            retry: retryNever(),
          }),
          model: "test-model",
        }).withTextPrompt(),
        "test prompt"
      );
      fail("Should have thrown ApiCallError");
    } catch (expectedError) {
      expect(expectedError).toBeInstanceOf(ApiCallError);
      expect((expectedError as ApiCallError).isRetryable).toBe(true);
    }
  });
});

describe("streamText", () => {
  const server = new StreamingTestServer("http://127.0.0.1:11434/api/generate");

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `{"model":"mistral:text","created_at":"2023-12-24T16:11:17.715003Z","response":"Hello","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:11:17.715003Z","response":", ","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:11:17.715003Z","response":"world!","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:11:19.697067Z","response":"",` +
        `"done":true,"context":[123,456,789],"total_duration":2165354041,"load_duration":1293958,` +
        `"prompt_eval_count":5,"prompt_eval_duration":193273000,"eval_count":136,"eval_duration":1966852000}\n`,
    ];

    const stream = await streamText(
      new OllamaCompletionModel({ model: "mistral:text" }).withTextPrompt(),
      "hello"
    );

    // note: space moved to last chunk bc of trimming
    expect(await arrayFromAsync(stream)).toStrictEqual([
      "Hello",
      ",",
      " world!",
    ]);
  });
});
