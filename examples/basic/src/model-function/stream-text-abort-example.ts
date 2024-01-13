import dotenv from "dotenv";
import { AbortError, delay, openai, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const abortController = new AbortController();

  // run async:
  (async () => {
    await delay(1500); // wait 1.5 seconds
    abortController.abort(); // aborts the streaming
  })();

  try {
    const textStream = await streamText({
      model: openai.CompletionTextGenerator({
        model: "gpt-3.5-turbo-instruct",
        maxGenerationTokens: 500,
      }),
      prompt: "Write a short story about a robot learning to love:\n\n",
      run: { abortSignal: abortController.signal },
    });

    for await (const textPart of textStream) {
      process.stdout.write(textPart);
    }
  } catch (error) {
    if (error instanceof AbortError) {
      console.log("\n\nAbortError: The run was aborted.");
    }
  }
}

main().catch(console.error);
