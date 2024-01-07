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
    rawResponse,
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

  console.log("RESPONSE:");
  console.log(JSON.stringify(rawResponse, null, 2));
  console.log();

  // cast to the response type:
  console.log("CHOICES:");
  for (const choice of (rawResponse as MistralChatResponse).choices) {
    console.log(choice.message);
    console.log(choice.finish_reason);
    console.log();
    console.log();
  }
}

main().catch(console.error);
