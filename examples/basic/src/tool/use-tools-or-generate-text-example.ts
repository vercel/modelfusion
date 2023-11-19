import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  useToolsOrGenerateText,
} from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [calculator /* ... */],
    [OpenAIChatMessage.user("What's fourteen times twelve?")]
  );

  if (text != null) {
    console.log(`TEXT: ${text}`);
    return;
  }

  for (const { tool, toolCall, args, ok, result } of toolResults ?? []) {
    console.log(`Tool call:`, toolCall);
    console.log(`Tool:`, tool);
    console.log(`Arguments:`, args);
    console.log(`Ok:`, ok);
    console.log(`Result or Error:`, result);
  }
}

main().catch(console.error);
