import dotenv from "dotenv";
import {
  InstructionPrompt,
  OpenAIChatModel,
  OpenAICompletionModel,
  TextStreamingModel,
  mapInstructionPromptToOpenAIChatFormat,
  mapInstructionPromptToTextFormat,
  streamText,
} from "modelfusion";

dotenv.config();

async function callModel(model: TextStreamingModel<InstructionPrompt>) {
  return streamText(model, {
    instruction: "Write a short story about a robot learning to love.",
  });
}

async function main() {
  const model =
    Math.random() < 0.5
      ? new OpenAICompletionModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 500,
        }).withPromptFormat(mapInstructionPromptToTextFormat())
      : new OpenAIChatModel({
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          maxCompletionTokens: 500,
        }).withPromptFormat(mapInstructionPromptToOpenAIChatFormat());

  const textStream = await callModel(model);

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
