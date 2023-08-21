import { LlamaCppTextGenerationModel, generateText } from "modelfusion";

(async () => {
  const text = await generateText(
    new LlamaCppTextGenerationModel({
      maxCompletionTokens: 512,
      temperature: 0.7,

      // Assuming the default Llama2 7B model is loaded, the context window size is 4096 tokens.
      // See https://www.philschmid.de/llama-2
      // Change value to match the context window size of the model you are using.
      contextWindowSize: 4096,
    }),
    "Write a short story about a robot learning to love."
  );

  console.log(text);
})();
