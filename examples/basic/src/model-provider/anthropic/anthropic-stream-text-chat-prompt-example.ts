import dotenv from "dotenv";
import { AnthropicTextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new AnthropicTextGenerationModel({
      model: "claude-instant-1",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }).withChatPrompt(),
    {
      // note: Anthropic models don't adhere well to the system message, we leave it out
      messages: [
        {
          role: "user",
          content: "Suggest a name for a robot.",
        },
        {
          role: "assistant",
          content: "I suggest the name Robbie",
        },
        {
          role: "user",
          content: "Write a short story about Robbie learning to love",
        },
      ],
    }
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
