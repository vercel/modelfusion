import dotenv from "dotenv";
import {
  HeliconeOpenAIApiConfiguration,
  generateText,
  openai,
} from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    openai.CompletionTextGenerator({
      api: new HeliconeOpenAIApiConfiguration(),
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxGenerationTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
