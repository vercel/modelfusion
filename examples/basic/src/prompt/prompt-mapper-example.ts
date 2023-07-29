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

  const model = new LlamaCppTextGenerationModel({}).mapPrompt(
    Llama2InstructionPromptMapping
  );

  const t = model.tokenizer;

  const textStream = await streamText(model, {
    system: "You are an AI assistant.",
    instruction: "Write a story about Berlin.",
  });

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
