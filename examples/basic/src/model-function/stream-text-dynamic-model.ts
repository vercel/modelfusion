import dotenv from "dotenv";
import {
  TextInstructionPrompt,
  TextStreamingModel,
  openai,
  streamText,
} from "modelfusion";

dotenv.config();

async function callModel(model: TextStreamingModel<TextInstructionPrompt>) {
  return streamText(model, {
    instruction: "Write a short story about a robot learning to love.",
  });
}

async function main() {
  const model =
    Math.random() < 0.5
      ? openai
          .CompletionTextGenerator({
            model: "gpt-3.5-turbo-instruct",
            temperature: 0.7,
            maxCompletionTokens: 500,
          })
          .withInstructionPrompt()
      : openai
          .ChatTextGenerator({
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            maxCompletionTokens: 500,
          })
          .withInstructionPrompt();

  const textStream = await callModel(model);

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
