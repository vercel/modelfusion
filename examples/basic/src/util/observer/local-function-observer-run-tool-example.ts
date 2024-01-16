import dotenv from "dotenv";
import { openai, runTool } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the function call:
  const { tool, result } = await runTool({
    model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    tool: calculator,
    prompt: [openai.ChatMessage.user("What's fourteen times twelve?")],
    observers: [customObserver],
  });
}

main().catch(console.error);
