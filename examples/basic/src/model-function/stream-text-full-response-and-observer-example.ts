import dotenv from "dotenv";
import {
  FunctionEvent,
  FunctionObserver,
  OpenAICompletionModel,
  streamText,
} from "modelfusion";

dotenv.config();

const customObserver: FunctionObserver = {
  onFunctionEvent(event: FunctionEvent) {
    console.log("\n\nEVENT:");
    console.log(JSON.stringify(event));
  },
};

async function main() {
  const { value: textStream, metadata } = await streamText(
    new OpenAICompletionModel({
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
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }

  console.log("\n\nMETADATA:");
  console.log(JSON.stringify(metadata));
}

main().catch(console.error);
