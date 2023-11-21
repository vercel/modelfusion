import dotenv from "dotenv";
import { OpenAICompletionModel, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withInstructionPrompt(),
    { instruction: "Write a story about a robot learning to love" }
  );

  console.log(text);
}

main().catch(console.error);
