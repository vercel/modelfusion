import dotenv from "dotenv";
import {
  OpenAIChatModel,
  OpenAITextGenerationModel,
  mapInstructionPromptToOpenAIChatFormat,
  mapInstructionPromptToTextFormat,
  streamText,
} from "modelfusion";

dotenv.config();

function getModel() {
  return Math.random() < 0.5
    ? new OpenAITextGenerationModel({
        model: "gpt-3.5-turbo-instruct",
        temperature: 0.7,
        maxCompletionTokens: 500,
      }).withPromptFormat(mapInstructionPromptToTextFormat())
    : new OpenAIChatModel({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        maxCompletionTokens: 500,
      }).withPromptFormat(mapInstructionPromptToOpenAIChatFormat());
}

async function main() {
  const { output: textStream, metadata } = await streamText(getModel(), {
    instruction: "Write a short story about a robot learning to love.",
  }).asFullResponse();

  console.log(metadata);

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
}

main().catch(console.error);
