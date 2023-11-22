import dotenv from "dotenv";
import { OpenAIChatMessage, openai, useTool } from "modelfusion";
import { calculator } from "../../tool/calculator-tool";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the function call:
  const { tool, result } = await useTool(
    openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    calculator,
    [OpenAIChatMessage.user("What's fourteen times twelve?")],
    { observers: [customObserver] }
  );
}

main().catch(console.error);
