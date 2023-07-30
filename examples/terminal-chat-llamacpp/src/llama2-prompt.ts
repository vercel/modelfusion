import {
  ChatPromptAiMessage,
  ChatPromptUserMessage,
  ChatToLlama2PromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "ai-utils.js";
import * as readline from "node:readline/promises";

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const messages: Array<ChatPromptUserMessage | ChatPromptAiMessage> = [];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ user: userInput });

    const responseStream = await streamText(
      new LlamaCppTextGenerationModel().mapPrompt(ChatToLlama2PromptMapping()),
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
