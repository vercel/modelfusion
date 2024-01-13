import dotenv from "dotenv";
import { generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  try {
    const text = await generateText({
      model: openai.CompletionTextGenerator({
        api: openai.Api({
          baseUrl: { host: "invalid-host" },
        }),
        model: "gpt-3.5-turbo-instruct",
        temperature: 0.7,
        maxGenerationTokens: 500,
      }),
      prompt: "Write a short story about a robot learning to love:\n\n",
    });

    console.log(text);
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.error);
