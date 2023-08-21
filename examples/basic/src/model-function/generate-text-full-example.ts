import { OpenAITextGenerationModel, generateText } from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  // access the full response and the metadata:
  // the response type is specific to the model that's being used
  const { response, metadata } = await generateText(
    new OpenAITextGenerationModel({
      model: "text-davinci-003",
      maxCompletionTokens: 1000,
      n: 2, // generate 2 completions
    }),
    "Write a short story about a robot learning to love:\n\n",
    { fullResponse: true }
  );

  for (const choice of response.choices) {
    console.log(choice.text);
  }

  console.log(`Duration: ${metadata.durationInMs}ms`);
})();
