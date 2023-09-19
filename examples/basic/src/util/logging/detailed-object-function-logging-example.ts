import { OpenAITextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "detailed-object" }
  );
}

main().catch(console.error);
