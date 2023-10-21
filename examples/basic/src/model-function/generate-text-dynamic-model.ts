import dotenv from "dotenv";
import {
  InstructionPrompt,
  OpenAIChatModel,
  OpenAICompletionModel,
  TextGenerationModel,
  generateText,
  mapInstructionPromptToOpenAIChatFormat,
  mapInstructionPromptToTextFormat,
} from "modelfusion";

dotenv.config();

async function callModel(model: TextGenerationModel<InstructionPrompt>) {
  return generateText(model, {
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

  const text = await callModel(model);

  console.log(text);
}

main().catch(console.error);
