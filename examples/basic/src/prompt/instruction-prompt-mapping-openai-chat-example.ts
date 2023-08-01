import {
  InstructionToOpenAIChatPromptMapping,
  OpenAIChatModel,
  streamText,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const { textStream } = await streamText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
    }).mapPrompt(InstructionToOpenAIChatPromptMapping()),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about a robot learning to love.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
