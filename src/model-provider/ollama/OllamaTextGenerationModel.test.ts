import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { generateText } from "../../model-function/generate-text/generateText.js";
import { OllamaTextGenerationModel } from "./OllamaTextGenerationModel.js";

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
      new OllamaTextGenerationModel({
        model: "test-model",
      }),
      "test prompt"
    );

    expect(result).toEqual("test response");
  });
});
