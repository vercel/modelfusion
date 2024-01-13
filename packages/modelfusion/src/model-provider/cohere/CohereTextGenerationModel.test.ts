import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { CohereApiConfiguration } from "./CohereApiConfiguration.js";
import { CohereTextGenerationModel } from "./CohereTextGenerationModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer("https://api.cohere.ai/v1/generate");

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `{"text":"Hello","is_finished":false}\n`,
      `{"text":", ","is_finished":false}\n`,
      `{"text":"world!","is_finished":false}\n`,
      `{"is_finished":true,"finish_reason":"COMPLETE",` +
        `"response":{"id":"40141e4f-2202-4e09-9188-c6ece324b7ba",` +
        `"generations":[{"id":"c598f9d2-4a6d-46d6-beed-47d55b996540",` +
        `"text":"Hello, world!","finish_reason":"COMPLETE"}],` +
        `"prompt":"hello"}}\n`,
    ];

    const stream = await streamText({
      model: new CohereTextGenerationModel({
        api: new CohereApiConfiguration({ apiKey: "test-key" }),
        model: "command-light",
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
});
