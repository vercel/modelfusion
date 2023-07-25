import { LlamaCppTextGenerationModel, streamText } from "ai-utils.js";
import * as readline from "node:readline/promises";

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ role: "user", content: userInput });

    const responseStream = await streamText(
      new LlamaCppTextGenerationModel({
        stop: ["user: "],
      }),
      [
        "You are an AI assistant. Follow the user's instructions carefully.\n",
        ...messages.map((message) => `${message.role}: ${message.content}\n`),
        "assistant: ",
      ].join("\n")
    );

    let fullResponse = "";
    process.stdout.write("\nAI : ");
    for await (const textFragment of responseStream) {
      fullResponse += textFragment;
      process.stdout.write(textFragment);
    }
    process.stdout.write("\n\n");
    messages.push({ role: "assistant", content: fullResponse });
  }
})();
