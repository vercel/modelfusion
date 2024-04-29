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

    // The advanced version that calls the Prompt consruction code
    const textStream = await streamText({
      model: ollama
        .CompletionTextGenerator({
          model: "llama3",
          promptTemplate: ollama.prompt.Llama3,
          raw: true, // required when using custom prompt template
        })
        .withChatPrompt(),
      prompt: chat,
    });

    //console.log("Full chat: " + JSON.stringify(chat));

    let fullResponse = "";

    process.stdout.write("\nAssistant : ");
    for await (const textPart of textStream) {
      fullResponse += textPart;
      process.stdout.write(textPart);
    }

    process.stdout.write("\n\n");

    chat.messages.push({ role: "assistant", content: fullResponse });
    //console.log("Full response: " + fullResponse);
  }
}

main().catch(console.error);
