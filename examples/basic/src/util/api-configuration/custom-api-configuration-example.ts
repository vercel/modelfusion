import dotenv from "dotenv";
import {
  BaseUrlApiConfiguration,
  OpenAITextGenerationModel,
  generateText,
} from "modelfusion";

dotenv.config();

async function main() {
  const api = new BaseUrlApiConfiguration({
    baseUrl: "https://openai.mycompany.com/v1/",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      Custom: "A custom header",
    },
  });

  const text = await generateText(
    new OpenAITextGenerationModel({
      model: "gpt-3.5-turbo-instruct",
      api,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
