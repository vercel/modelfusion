import {
  ChatToTextPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "ai-utils.js";
import * as readline from "node:readline/promises";

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const messages: Array<{ user: string } | { ai: string }> = [];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ user: userInput });

    const responseStream = await streamText(
      new LlamaCppTextGenerationModel().mapPrompt(
        ChatToTextPromptMapping({ user: "user", ai: "assistant" })
      ),
      [
        {
          system:
            "You are an AI assistant. Follow the user's instructions carefully.",
        },
        ...messages,
      ]
    );

    let fullResponse = "";
    process.stdout.write("\nAI : ");
    for await (const textFragment of responseStream) {
      fullResponse += textFragment;
      process.stdout.write(textFragment);
    }
    process.stdout.write("\n\n");
    messages.push({ ai: fullResponse });
  }
})();
