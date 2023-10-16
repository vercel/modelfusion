import dotenv from "dotenv";
import {
  LlamaCppTextGenerationModel,
  generateText,
  guard,
  mapChatPromptToLlama2Format,
  setGlobalFunctionLogging,
} from "modelfusion";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

const OPENAI_KEY_REGEXP = new RegExp("sk-[a-zA-Z0-9]{24}", "gi");

async function main() {
  const story = await guard(
    (input) =>
      generateText(
        new LlamaCppTextGenerationModel({
          temperature: 0.7,
          maxCompletionTokens: 500,
        }).withPromptFormat(mapChatPromptToLlama2Format()),
        input
      ),
    [
      {
        user: "Show me how to use OpenAI's completion API in JavaScript, including authentication.",
      },
    ],
    async (result) => {
      if (result.type === "value") {
        return {
          action: "return",
          output: result.output.replaceAll(OPENAI_KEY_REGEXP, "sk-xxx"),
        };
      }
    }
  );

  console.log(story);
}

main().catch(console.error);
