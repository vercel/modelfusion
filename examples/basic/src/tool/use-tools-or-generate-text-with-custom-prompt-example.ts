import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  setGlobalFunctionLogging,
  useToolsOrGenerateText,
} from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

setGlobalFunctionLogging("basic-text");

async function main() {
  const { text, toolResults } = await useToolsOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [calculator /* ... */],
    // Instead of using a curried function,
    // you can also work with the tools directly:
    (tools) => [
      OpenAIChatMessage.system(
        // Here the available tools are used to create
        // a more precise prompt that reduces errors:
        `You have ${tools.length} tools available (${tools
          .map((tool) => tool.name)
          .join(", ")}).`
      ),
      OpenAIChatMessage.user("What's fourteen times twelve?"),
      // OpenAIChatMessage.user("What's twelve plus 1234?"),
      // OpenAIChatMessage.user("Tell me about Berlin"),
    ]
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
