import dotenv from "dotenv";
import {
  TextGenerationModel,
  InstructionPrompt,
  generateText,
  openai,
} from "modelfusion";

dotenv.config();

async function callModel(model: TextGenerationModel<InstructionPrompt>) {
  return generateText({
    model,
    prompt: {
      instruction: "Write a short story about a robot learning to love.",
    },
  });
}

async function main() {
  const model =
    Math.random() < 0.5
      ? openai
          .CompletionTextGenerator({
            model: "gpt-3.5-turbo-instruct",
            temperature: 0.7,
            maxGenerationTokens: 500,
          })
          .withInstructionPrompt()
      : openai
          .ChatTextGenerator({
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            maxGenerationTokens: 500,
          })
          .withInstructionPrompt();

  const text = await callModel(model);

  console.log(text);
}

main().catch(console.error);
