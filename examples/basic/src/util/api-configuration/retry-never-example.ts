import dotenv from "dotenv";
import { generateText, openai, retryNever } from "modelfusion";

dotenv.config();

async function main() {
  const api = openai.Api({
    retry: retryNever(),
  });

  const text = await generateText(
    openai.CompletionTextGenerator({
      api,
      model: "gpt-3.5-turbo-instruct",
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  console.log(text);
}

main().catch(console.error);
