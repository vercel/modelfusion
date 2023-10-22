import dotenv from "dotenv";
import {
  LlamaCppTextGenerationModel,
  generateText,
  guard,
  mapInstructionPromptToLlama2Format,
  setGlobalFunctionLogging,
} from "modelfusion";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

const OPENAI_KEY_REGEXP = new RegExp("sk-[a-zA-Z0-9]{24}", "gi");

async function main() {
  const result = await guard(
    (input, options) =>
      generateText(
        new LlamaCppTextGenerationModel({
          temperature: 0.7,
          maxCompletionTokens: 500,
        }).withPromptFormat(mapInstructionPromptToLlama2Format()),
        input,
        options
      ),
    {
      instruction:
        "Show me how to use OpenAI's completion API in JavaScript, including authentication.",
    },
    async (result) => {
      if (result.type === "value") {
        return {
          action: "return",
          output: result.output.replaceAll(OPENAI_KEY_REGEXP, "sk-xxx"),
        };
      }
    }
  );

  console.log(result);
}

main().catch(console.error);
