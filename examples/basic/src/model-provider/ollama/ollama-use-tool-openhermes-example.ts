import dotenv from "dotenv";
import {
  ChatMLPromptFormat,
  FunctionListToolCallPromptFormat,
  OllamaApiConfiguration,
  OllamaTextGenerationModel,
  retryNever,
  setGlobalFunctionLogging,
  useTool,
} from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

setGlobalFunctionLogging("detailed-object");

async function main() {
  const { tool, args, toolCall, result } = await useTool(
    new OllamaTextGenerationModel({
      model: "openhermes2.5-mistral",
      temperature: 0,
      api: new OllamaApiConfiguration({ retry: retryNever() }),
    }).asToolCallGenerationModel(
      FunctionListToolCallPromptFormat.instruction({
        baseFormat: ChatMLPromptFormat.instruction(),
      })
    ),
    calculator,
    { instruction: "What's fourteen times twelve?" }
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
