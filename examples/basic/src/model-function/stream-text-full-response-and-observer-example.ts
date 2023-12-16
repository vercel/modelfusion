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
  const { textStream, metadata } = await streamText(
    openai
      .CompletionTextGenerator({
        model: "gpt-3.5-turbo-instruct",
        maxCompletionTokens: 500,
      })
      .withInstructionPrompt(),
    { instruction: "Write a story about a robot learning to love" },
    {
      functionId: "generate-story",
      fullResponse: true,
      observers: [customObserver],
    }
  );

  console.log("\n\nMETADATA:");
  console.log(JSON.stringify(metadata));

  console.log("\n\nCONTENT:");
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
