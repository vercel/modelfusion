import dotenv from "dotenv";
import { openai, streamText } from "modelfusion";
import * as readline from "node:readline/promises";

dotenv.config();

const systemPrompt = `You are a helpful, respectful and honest assistant.`;

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const chat: openai.ChatPrompt = [{ role: "system", content: systemPrompt }];

  while (true) {
    const userInput = await terminal.question("You: ");

    chat.push({ role: "user", content: userInput });

    const textStream = await streamText({
      model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
      prompt: chat,
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant : ");
    for await (const textPart of textStream) {
      fullResponse += textPart;
      process.stdout.write(textPart);
    }
    process.stdout.write("\n\n");

    chat.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
