import dotenv from "dotenv";
import { OllamaTextGenerationModel, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    new OllamaTextGenerationModel({
      model: "mistral",
      maxCompletionTokens: 120,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
