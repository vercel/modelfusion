import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { streamText } from "../../../model-function/generate-text/streamText.js";
import { OpenAIChatModel } from "./OpenAIChatModel.js";
import { OpenAIApiConfiguration } from "../OpenAIApiConfiguration.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let responseChunks: any[] = [];

const server = setupServer(
  http.post("https://api.openai.com/v1/chat/completions", () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const chunk of responseChunks) {
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  responseChunks = [];
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("streamText", () => {
  it("should return only values from the first choice when using streamText", async () => {
    responseChunks = [
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{"content":"A"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{"role":"assistant","content":""},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{"content":"B"},"finish_reason":null}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n`,
      `data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1702657020,"model":"gpt-3.5-turbo-0613","system_fingerprint":null,"choices":[{"index":1,"delta":{},"finish_reason":"stop"}]}\n\n`,
      "data: [DONE]\n\n",
    ];

    const stream = await streamText(
      new OpenAIChatModel({
        api: new OpenAIApiConfiguration({ apiKey: "test" }),
        model: "gpt-3.5-turbo",
        numberOfGenerations: 2,
      }).withTextPrompt(),
      "test prompt"
    );

    const chunks = [];
    for await (const part of stream) {
      chunks.push(part);
    }

    expect(chunks).toStrictEqual(["A"]);
  });
});
