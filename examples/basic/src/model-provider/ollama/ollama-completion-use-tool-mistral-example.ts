import { MathJsTool } from "@modelfusion/mathjs-tool";
import dotenv from "dotenv";
import {
  MistralInstructPrompt,
  jsonToolCallPrompt,
  ollama,
  useTool,
} from "modelfusion";

dotenv.config();

// modelfusion.setLogFormat("detailed-object");

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    ollama
      .CompletionTextGenerator({
        model: "mistral",
        format: "json",
        temperature: 0,
        raw: true, // use prompt template below
        stopSequences: ["\n\n"], // prevent infinite generation
      })
      .withTextPromptTemplate(MistralInstructPrompt.instruction())
      .asToolCallGenerationModel(jsonToolCallPrompt.text()),

    new MathJsTool({ name: "calculator" }),
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
