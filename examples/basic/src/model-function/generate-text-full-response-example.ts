import {
  OpenAICompletionModel,
  OpenAICompletionResponse,
  generateText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // access the full response and the metadata:
  const { response, metadata } = await generateText(
    new OpenAICompletionModel({
      model: "gpt-3.5-turbo-instruct",
      maxCompletionTokens: 1000,
      n: 2, // generate 2 completions
    }),
    "Write a short story about a robot learning to love:\n\n",
    { returnType: "full" }
  );

  console.log(metadata);

  // cast to the response type:
  for (const choice of (response as OpenAICompletionResponse).choices) {
    console.log(choice.text);
    console.log();
    console.log();
  }
}

main().catch(console.error);
