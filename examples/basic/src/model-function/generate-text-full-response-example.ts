import { openai, OpenAICompletionResponse, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // access the full result and the metadata:
  const {
    text,
    finishReason,
    texts,
    textGenerationResults,
    response,
    metadata,
  } = await generateText(
    openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      numberOfGenerations: 2,
      maxGenerationTokens: 1000,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  console.log(metadata);

  // cast to the response type:
  for (const choice of (response as OpenAICompletionResponse).choices) {
    console.log(choice.text);
    console.log(choice.finish_reason);
    console.log();
    console.log();
  }
}

main().catch(console.error);
