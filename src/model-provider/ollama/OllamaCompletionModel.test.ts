import { fail } from "assert";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ApiCallError } from "../../core/api/ApiCallError.js";
import { retryNever } from "../../core/api/retryNever.js";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { OllamaApiConfiguration } from "./OllamaApiConfiguration.js";
import { OllamaCompletionModel } from "./OllamaCompletionModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let responseBodyJson: any = {};

const server = setupServer(
  http.post("http://127.0.0.1:11434/api/generate", () =>
    HttpResponse.json(responseBodyJson)
  )
);

beforeAll(() => server.listen());
beforeEach(() => {
  responseBodyJson = {};
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("generateText", () => {
  it("should return the generated text", async () => {
    responseBodyJson = {
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
    responseBodyJson = {
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
