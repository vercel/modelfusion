import { ollama, streamText } from "modelfusion";
import * as readline from "node:readline/promises";

const systemPrompt = `You are a helpful, respectful and honest assistant.`;

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const chat: ollama.ChatPrompt = [{ role: "system", content: systemPrompt }];

  while (true) {
    const userInput = await terminal.question("You: ");

    chat.push({ role: "user", content: userInput });

    const textStream = await streamText(
      ollama.ChatTextGenerator({ model: "llama2:chat" }),
      chat
    );

    process.stdout.write("\nAssistant : ");

    let fullResponse = "";
    for await (const textPart of textStream) {
      fullResponse += textPart;
      process.stdout.write(textPart);
    }

    process.stdout.write("\n\n");

    chat.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
