import dotenv from "dotenv";
import { ollama, useTool } from "modelfusion";
import { mistralSingleToolCallPromptFormat } from "../../tool/prompts/mistral";
import { calculator } from "../../tool/tools/calculator-tool";

dotenv.config();

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    ollama
      .TextGenerator({
        model: "mistral",
        format: "json",
        temperature: 0,
        raw: true,
      })
      .asToolCallGenerationModel(mistralSingleToolCallPromptFormat),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
