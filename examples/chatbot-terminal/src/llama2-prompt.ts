import {
  LlamaCppTextGenerationModel,
  mapChatPromptToLlama2Format,
  streamText,
  trimChatPrompt,
} from "modelfusion";
import * as readline from "node:readline/promises";

const systemPrompt = `You are a helpful, respectful and honest assistant.`;

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const messages: Array<{ user: string } | { ai: string }> = [];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ user: userInput });

    const model = new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      maxCompletionTokens: 512,
    })
      .withTextPrompt()
      .withPromptFormat(mapChatPromptToLlama2Format());

    const textStream = await streamText(
      model,
      await trimChatPrompt({
        prompt: [{ system: systemPrompt }, ...messages],
        model,
      })
    );

    let fullResponse = "";
    process.stdout.write("\nAI : ");
    for await (const textPart of textStream) {
      fullResponse += textPart;
      process.stdout.write(textPart);
    }
    process.stdout.write("\n\n");
    messages.push({ ai: fullResponse });
  }
}

main().catch(console.error);
