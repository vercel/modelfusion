import {
  ChatPrompt,
  ChatToTextPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
  trimChatPrompt,
} from "ai-utils.js";
import * as readline from "node:readline/promises";

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const messages: Array<
    { system: string } | { user: string } | { ai: string }
  > = [
    {
      system:
        "You are an AI assistant. Follow the user's instructions carefully.",
    },
  ];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ user: userInput });

    const model = new LlamaCppTextGenerationModel().mapPrompt(
      ChatToTextPromptMapping({ user: "user", ai: "assistant" })
    );

    const responseStream = await streamText(
      model,
      await trimChatPrompt({ prompt: messages as ChatPrompt, model })
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
