import {
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAIChatResponseFormat,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const model = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxCompletionTokens: 500,
  });

  const deltas = await model.callAPI(
    [
      OpenAIChatMessage.system("You are a story writer. Write a story about:"),
      OpenAIChatMessage.user("A robot learning to love"),
    ],
    { responseFormat: OpenAIChatResponseFormat.deltaIterable }
  );

  for await (const delta of deltas) {
    if (delta?.type === "error") {
      throw delta.error;
    }

    process.stdout.write(delta?.fullDelta[0].delta.content ?? "");
  }
})();
