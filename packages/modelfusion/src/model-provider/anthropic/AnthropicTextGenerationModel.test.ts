import { streamText } from "../../model-function/generate-text/streamText.js";
import { StreamingTestServer } from "../../test/StreamingTestServer.js";
import { arrayFromAsync } from "../../test/arrayFromAsync.js";
import { AnthropicApiConfiguration } from "./AnthropicApiConfiguration.js";
import { AnthropicTextGenerationModel } from "./AnthropicTextGenerationModel.js";

describe("streamText", () => {
  const server = new StreamingTestServer(
    "https://api.anthropic.com/v1/complete"
  );

  server.setupTestEnvironment();

  it("should return a text stream", async () => {
    server.responseChunks = [
      `event: completion\n` +
        `data: {"type":"completion","id":"compl_01Vtux5THXXB3eXhFSA5eTY6",` +
        `"completion":" Hello","stop_reason":null,"model":"claude-instant-1.2",` +
        `"stop":null,"log_id":"compl_01Vtux5THXXB3eXhFSA5eTY6"}\n\n`,
      `event: completion\n` +
        `data: {"type":"completion","id":"compl_01Vtux5THXXB3eXhFSA5eTY6",` +
        `"completion":", ","stop_reason":null,"model":"claude-instant-1.2",` +
        `"stop":null,"log_id":"compl_01Vtux5THXXB3eXhFSA5eTY6"}\n\n`,
      `event: completion\n` +
        `data: {"type":"completion","id":"compl_01Vtux5THXXB3eXhFSA5eTY6",` +
        `"completion":"world!","stop_reason":null,"model":"claude-instant-1.2",` +
        `"stop":null,"log_id":"compl_01Vtux5THXXB3eXhFSA5eTY6"}\n\n`,
      `event: ping\ndata: {"type": "ping"}\n\n`,
      `event: completion\n` +
        `data: {"type":"completion","id":"compl_01Vtux5THXXB3eXhFSA5eTY6",` +
        `"completion":"","stop_reason":"stop_sequence","model":"claude-instant-1.2",` +
        `"stop":"\\n\\nHuman:","log_id":"compl_01Vtux5THXXB3eXhFSA5eTY6"}\n\n`,
    ];

    const stream = await streamText(
      new AnthropicTextGenerationModel({
        api: new AnthropicApiConfiguration({
          apiKey: "test-key",
        }),
        model: "claude-instant-1",
      }).withTextPrompt(),
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
