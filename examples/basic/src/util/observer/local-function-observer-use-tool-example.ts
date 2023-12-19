import dotenv from "dotenv";
import { openai, useTool } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the function call:
  const { tool, result } = await useTool(
    openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    calculator,
    [openai.ChatMessage.user("What's fourteen times twelve?")],
    { observers: [customObserver] }
  );
}

main().catch(console.error);
