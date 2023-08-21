import {
  CohereTextGenerationModel,
  TextInstructionPromptFormat,
  streamText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const textStream = await streamText(
    new CohereTextGenerationModel({
      model: "command",
      maxCompletionTokens: 500,
    }).withPromptFormat(TextInstructionPromptFormat()),
    {
      system: "You are a celebrated poet.",
      instruction: "Write a short story about:",
      input: "a robot learning to love",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
