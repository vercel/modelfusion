import {
  ChatToLlama2PromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
  trimChatPrompt,
} from "ai-utils.js";
import * as readline from "node:readline/promises";

const systemPrompt = `You are a helpful, respectful and honest assistant.`;

const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const messages: Array<{ user: string } | { ai: string }> = [];

  while (true) {
    const userInput = await chat.question("You: ");

    messages.push({ user: userInput });

    const model = new LlamaCppTextGenerationModel({
      contextWindowSize: 4096, // Llama 2 context window size
      nPredict: 512,
    }).mapPrompt(ChatToLlama2PromptMapping());

    const responseStream = await streamText(
      model,
      await trimChatPrompt({
        prompt: [{ system: systemPrompt }, ...messages],
        model,
      })
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
