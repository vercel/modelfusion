import dotenv from "dotenv";
import { AnthropicTextGenerationModel, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    new AnthropicTextGenerationModel({
      model: "claude-instant-1",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    "Human: Write a short story about a robot learning to love:\n\nAssistant:"
  );

  console.log(text);
}

main().catch(console.error);
