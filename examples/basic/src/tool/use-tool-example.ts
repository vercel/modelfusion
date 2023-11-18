import dotenv from "dotenv";
import { OpenAIChatMessage, OpenAIChatModel, useTool } from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

async function main() {
  const { tool, toolCall, args, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    [OpenAIChatMessage.user("What's fourteen times twelve?")]
  );

  console.log(`Tool call`, toolCall);
  console.log(`Tool: ${tool}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
