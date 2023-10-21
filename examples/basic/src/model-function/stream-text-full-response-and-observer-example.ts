import dotenv from "dotenv";
import {
  FunctionEvent,
  FunctionObserver,
  OpenAITextGenerationModel,
  streamText2,
} from "modelfusion";

dotenv.config();

const customObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    console.log("\n\nEVENT:");
    console.log(JSON.stringify(event));
  },
};

async function main() {
  const { value: textStream, metadata } = await streamText2(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 500,
    }).withInstructionPrompt(),
    {
      instruction: "You are a story writer. Write a story about:",
      input: "A robot learning to love",
    },
    {
      functionId: "generate-story",
      observers: [customObserver],
    }
  ).asFullResponse();

  console.log("\n\nCONTENT:");
  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }

  console.log("\n\nMETADATA:");
  console.log(JSON.stringify(metadata));
}

main().catch(console.error);
