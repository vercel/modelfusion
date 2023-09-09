import dotenv from "dotenv";
import {
  OpenAIApiConfiguration,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";

dotenv.config();

async function main() {
  try {
    const text = await generateText(
      new OpenAITextGenerationModel({
        api: new OpenAIApiConfiguration({
          baseUrl: "invalid-url",
        }),
        model: "text-davinci-003",
        temperature: 0.7,
        maxCompletionTokens: 500,
      }),
      "Write a short story about a robot learning to love:\n\n"
    );

    console.log(text);
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);
