import dotenv from "dotenv";
import {
  OllamaTextGenerationModel,
  TextGenerationToolCallModel,
  FunctionListToolCallPromptFormat,
  useTool,
} from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    new TextGenerationToolCallModel({
      model: new OllamaTextGenerationModel({
        model: "mistral",
        format: "json",
        temperature: 0,
      }),
      format: new FunctionListToolCallPromptFormat(),
    }),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
