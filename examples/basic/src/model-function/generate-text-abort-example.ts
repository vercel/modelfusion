import dotenv from "dotenv";
import { AbortError, generateText, openai } from "modelfusion";

dotenv.config();

async function main() {
  const abortController = new AbortController();

  generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      maxGenerationTokens: 500,
    }),

    prompt: "Write a short story about a robot learning to love:\n\n",

    run: { abortSignal: abortController.signal },
  })
    .then((text) => {
      console.log(text);
    })
    .catch((error) => {
      if (error instanceof AbortError) {
        console.log("the run was aborted");
      }
    });

  abortController.abort(); // aborts the running generate text call
}

main().catch(console.error);
