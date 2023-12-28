import dotenv from "dotenv";
import { generateText, modelfusion, openai } from "modelfusion";
import { guard } from "modelfusion-experimental";

dotenv.config();

modelfusion.setLogFormat("detailed-object");

// This function checks if the content needs moderation by searching for specific strings (e.g., "Nox").
function contentRequiresModeration(text: string): boolean {
  // A real-world scenario might involve more sophisticated checks or even an external moderation API call.
  return text.includes("Nox");
}

async function main() {
  const story = await guard(
    (input, options) =>
      generateText(
        openai.CompletionTextGenerator({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxGenerationTokens: 250,
        }),
        input,
        options
      ),
    "Write a short story about a robot called Nox:\n\n", // without including the word Nox
    async (result) => {
      // If there's no error and the content needs moderation, throw a custom error.
      if (result.type === "value" && contentRequiresModeration(result.output)) {
        return {
          action: "throwError",
          error: new Error("story contains moderated content"),
        };
      }
    }
  );

  console.log(story);
}

main().catch(console.error);
