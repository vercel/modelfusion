import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { OllamaChatModel } from "./OllamaChatModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer("http://127.0.0.1:11434/api/chat");

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `{"model":"mistral:text","created_at":"2023-12-24T16:49:17.948267Z","message":{"role":"assistant","content":"Hello"},"done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:49:17.948267Z","message":{"role":"assistant","content":", "},"done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:49:17.948267Z","message":{"role":"assistant","content":"world!"},"done":false}\n`,
      `{"model":"mistral:text","created_at":"2023-12-24T16:49:19.927399Z","message":{"role":"assistant","content":""},` +
        `"done":true,"total_duration":4843619375,"load_duration":1101458,"prompt_eval_count":5,"prompt_eval_duration":199339000,` +
        `"eval_count":317,"eval_duration":4639772000}\n`,
    ];

    const stream = await streamText({
      model: new OllamaChatModel({
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
