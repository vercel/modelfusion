import dotenv from "dotenv";
import { FunctionListToolCallPromptFormat, ollama, useTool } from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    ollama
      .TextGenerator({
        model: "mistral",
        temperature: 0,
      })
      .asToolCallGenerationModel(FunctionListToolCallPromptFormat.text()),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
