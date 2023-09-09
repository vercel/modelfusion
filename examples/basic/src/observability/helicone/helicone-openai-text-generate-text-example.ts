import {
  HeliconeOpenAIApiConfiguration,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const text = await generateText(
    new OpenAITextGenerationModel({
      api: new HeliconeOpenAIApiConfiguration(),
      model: "text-davinci-003",
      temperature: 0.7,
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
