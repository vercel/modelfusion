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

    // These instructions use the special Llama 2 prompt tokens.
    // They work with the original Llama models.
    // However, in fine-tuned models they may or may not work.
    //
    // See https://huggingface.co/blog/llama2#how-to-prompt-llama-2
    // for more information.
    const responseStream = await streamText(
      new LlamaCppTextGenerationModel({
        stop: ["</s>"],
      }),
      [
        "<s>[INST] <<SYS>>",
        "You are an AI assistant. " +
          "Follow the user's instructions carefully.",
        "<</SYS>> [/INST] </s>\n",
        ...messages.map(({ role, content }) =>
          role === "assistant"
            ? `${content} </s>`
            : `<s>[INST] ${content} [/INST]\n`
        ),
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
