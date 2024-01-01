import dotenv from "dotenv";
import { api, generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const text = await generateText(
    openai.CompletionTextGenerator({
      api: openai.Api({
        retry: api.retryNever(),
      }),
      model: "gpt-3.5-turbo-instruct",
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
