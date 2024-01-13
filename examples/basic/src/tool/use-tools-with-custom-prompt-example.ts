import dotenv from "dotenv";
import { modelfusion, openai, useTools } from "modelfusion";
import { calculator } from "./tools/calculator-tool";

dotenv.config();

modelfusion.setLogFormat("basic-text");

async function main() {
  const { text, toolResults } = await useTools({
    model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    tools: [calculator /* ... */],
    // Instead of using a curried function,
    // you can also work with the tools directly:
    prompt: (tools) => [
      openai.ChatMessage.system(
        // Here the available tools are used to create
        // a more precise prompt that reduces errors:
        `You have ${tools.length} tools available (${tools
          .map((tool) => tool.name)
          .join(", ")}).`
      ),
      openai.ChatMessage.user("What's fourteen times twelve?"),
      // openai.ChatMessage.user("What's twelve plus 1234?"),
      // openai.ChatMessage.user("Tell me about Berlin"),
    ],
  });

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
