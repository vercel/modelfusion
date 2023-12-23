import { mistral, generateText, MistralChatResponse } from "modelfusion";
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
    mistral
      .ChatTextGenerator({
        model: "mistral-medium",
        maxGenerationTokens: 120,
      })
      .withTextPrompt(),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  console.log(JSON.stringify(response));
  console.log();

  // cast to the response type:
  for (const choice of (response as MistralChatResponse).choices) {
    console.log(choice.message);
    console.log(choice.finish_reason);
    console.log();
    console.log();
  }
}

main().catch(console.error);
