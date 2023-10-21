import { OpenAICompletionModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: basic-text");
  console.log();

  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 50,
    }),
    "Write a short story about a robot learning to love:\n\n",
    { logging: "basic-text" }
  );
}

main().catch(console.error);
