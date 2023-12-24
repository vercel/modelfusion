import { ChatPrompt, ollama, streamText } from "modelfusion";
import * as readline from "node:readline/promises";

const systemPrompt = `You are a helpful, respectful and honest assistant.`;

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const chat: ChatPrompt = { system: systemPrompt, messages: [] };

  while (true) {
    const userInput = await terminal.question("You: ");

    chat.messages.push({ role: "user", content: userInput });

    const textStream = await streamText(
      ollama.ChatTextGenerator({ model: "llama2:chat" }).withChatPrompt(),
      chat
    );

    let fullResponse = "";
    process.stdout.write("\nAssistant : ");
    for await (const textPart of textStream) {
      fullResponse += textPart;
      process.stdout.write(textPart);
    }
    process.stdout.write("\n\n");

    chat.messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
