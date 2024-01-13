import dotenv from "dotenv";
import {
  FunctionEvent,
  FunctionObserver,
  openai,
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
  const { textStream, metadata } = await streamText({
    model: openai
      .CompletionTextGenerator({
        model: "gpt-3.5-turbo-instruct",
        maxGenerationTokens: 500,
      })
      .withInstructionPrompt(),
    prompt: { instruction: "Write a story about a robot learning to love" },

    fullResponse: true,
    functionId: "generate-story",
    observers: [customObserver],
  });

  console.log("\n\nMETADATA:");
  console.log(JSON.stringify(metadata));

  console.log("\n\nCONTENT:");
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
