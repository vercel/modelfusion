import {
  OpenAIChatInstructionPromptMapping,
  OpenAIChatModel,
  streamText,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textStream = await streamText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
    }).mapPrompt(OpenAIChatInstructionPromptMapping),
    {
      system: "You are an AI assistant.",
      instruction: "Write a story about Berlin.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
