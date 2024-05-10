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
    let userInput = await terminal.question("You: ");

    chat.messages.push({ role: "user", content: userInput });

    // Llama3 we have to explicitly set the stop option value as otherwise it never ends the response
    // - see https://github.com/ollama/ollama/issues/3759#issuecomment-2076973989
    let model = ollama
      .ChatTextGenerator({
        model: "llama3",
        stopSequences: ollama.prompt.Llama3.chat().stopSequences,
      })
      .withChatPrompt();

    const textStream = await streamText({
      model: model,
      prompt: chat,
    });

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
