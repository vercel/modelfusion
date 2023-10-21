import { OpenAICompletionModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
