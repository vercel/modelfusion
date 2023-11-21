import dotenv from "dotenv";
import {
  FunctionListToolCallPromptFormat,
  OllamaTextGenerationModel,
  useTool,
} from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    new OllamaTextGenerationModel({
      model: "mistral",
      temperature: 0,
    }).asToolCallGenerationModel(new FunctionListToolCallPromptFormat()),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
