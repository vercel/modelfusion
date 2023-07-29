import {
  Llama2InstructionPromptMapping,
  LlamaCppTextGenerationModel,
  streamText,
} from "ai-utils.js";

(async () => {
  // const text = await generateText(
  //   Llama2Prompt.forInstruction(new LlamaCppTextGenerationModel({})),
  //   {
  //     system:
  //       "You are an AI assistant. Follow the user's instructions carefully",
  //     instruction: "Write a story about Berlin.",
  //   }
  // );
  // console.log(text);

  const textStream = await streamText(
    new LlamaCppTextGenerationModel({}).mapPrompt(
      Llama2InstructionPromptMapping
    ),
    {
      system: "You are an AI assistant.",
      instruction: "Write a story about Berlin.",
    }
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
