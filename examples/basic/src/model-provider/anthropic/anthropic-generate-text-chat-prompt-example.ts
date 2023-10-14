import dotenv from "dotenv";
import { AnthropicTextGenerationModel, generateText } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    new AnthropicTextGenerationModel({
      model: "claude-instant-1",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withChatPrompt(),
    [
      { user: "Suggest a name for a robot" },
      { ai: "I suggest the name Robbie" },
      { user: "Write a short story about a robot learning to love" },
    ]
  );

  console.log(text);
}

main().catch(console.error);
