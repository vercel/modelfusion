import { ChatMLPrompt, llamacpp, streamText } from "modelfusion";

async function main() {
  const textStream = await streamText(
    llamacpp
      .TextGenerator({
        // run openhermes-2.5-mistral-7b.Q4_K_M.gguf in llama.cpp
        maxGenerationTokens: 512,
        temperature: 0,
        grammar: llamacpp.grammar.list, // simple list grammar
        promptTemplate: llamacpp.prompt.ChatML,
      })
      .withTextPrompt(),

    "List the top 10 tourist attractions in Paris. Only mention the name of each attraction."
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
