import { fail } from "assert";
import { z } from "zod";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { retryNever } from "../../core/api/retryNever.js";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { jsonStructurePrompt } from "../../model-function/generate-structure/jsonStructurePrompt.js";
import { streamStructure } from "../../model-function/generate-structure/streamStructure.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { streamText } from "../../model-function/generate-text/streamText.js";
import { JsonTestServer } from "../../test/JsonTestServer.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { OllamaCompletionModel } from "./OllamaCompletionModel.js";
import { Text } from "./OllamaCompletionPrompt.js";

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

    const result = await generateText({
      model: new OllamaCompletionModel({
        model: "test-model",
      }).withTextPrompt(),
      prompt: "test prompt",
    });

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
      await generateText({
        model: new OllamaCompletionModel({
          api: new OllamaApiConfiguration({
            retry: retryNever(),
          }),
          model: "test-model",
        }).withTextPrompt(),
        prompt: "test prompt",
      });
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

    const stream = await streamText({
      model: new OllamaCompletionModel({
        model: "mistral:text",
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
});

describe("streamStructure", () => {
  const server = new StreamingTestServer("http://127.0.0.1:11434/api/generate");

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.253175Z","response":"{","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.273505Z","response":"\\n","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.293192Z","response":"   ","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.312446Z","response":" \\"","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.332021Z","response":"name","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.351128Z","response":"\\":","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.372082Z","response":" \\"","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.391903Z","response":"M","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.411056Z","response":"ike","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.430789Z","response":"\\"","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.450216Z","response":"\\n","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.47009Z","response":"}","done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-25T11:48:02.48885Z","response":"","done":true,` +
        `"total_duration":521893000,"load_duration":957666,"prompt_eval_count":74,"prompt_eval_duration":302508000,` +
        `"eval_count":12,"eval_duration":215282000}\n`,
    ];

    const stream = await streamStructure({
      model: new OllamaCompletionModel({
        model: "mistral:text",
        promptTemplate: Text,
        format: "json",
        raw: true,
      }).asStructureGenerationModel(jsonStructurePrompt.text()),

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
