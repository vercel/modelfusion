import dotenv from "dotenv";
import { OpenAIChatMessage, OpenAIChatModel, useTool } from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

async function main() {
  const { tool, toolCall, args, ok, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    [OpenAIChatMessage.user("What's fourteen times twelve?")]
  );

  console.log(`Tool call:`, toolCall);
  console.log(`Tool:`, tool);
  console.log(`Arguments:`, args);
  console.log(`Ok:`, ok);
  console.log(`Result or Error:`, result);
}

main().catch(console.error);
