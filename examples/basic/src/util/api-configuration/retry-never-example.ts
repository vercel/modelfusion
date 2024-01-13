import dotenv from "dotenv";
import { api, generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openai.CompletionTextGenerator({
      api: openai.Api({
        retry: api.retryNever(),
      }),
      model: "gpt-3.5-turbo-instruct",
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
  });

  console.log(text);
}

main().catch(console.error);
