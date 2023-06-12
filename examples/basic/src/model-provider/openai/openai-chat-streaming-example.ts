import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatResponseFormat,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 500,
  });

  const stream = await model.callAPI(
    [
      OpenAIChatMessage.system(
        "Write a short story about a robot learning to love:"
      ),
    ],
    { responseFormat: OpenAIChatResponseFormat.asyncDeltaIterable }
  );

  for await (const piece of stream) {
    if (piece?.type === "delta") {
      process.stdout.write(piece.delta[0].delta.content ?? "");
    }
  }
})();
