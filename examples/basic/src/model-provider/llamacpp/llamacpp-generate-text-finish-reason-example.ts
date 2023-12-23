import { Llama2Prompt, generateText, llamacpp } from "modelfusion";

async function main() {
  const { text, finishReason } = await generateText(
    llamacpp
      .TextGenerator({ maxGenerationTokens: 200 })
      .withTextPromptTemplate(Llama2Prompt.text()), // assumes you run a Llama2 model in llama.cpp
    "Write a short story about a robot learning to love:",
    { fullResponse: true }
  );

  console.log(text);
  console.log();
  console.log("Finish reason:", finishReason);
}

main().catch(console.error);
