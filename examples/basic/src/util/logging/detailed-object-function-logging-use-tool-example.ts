import dotenv from "dotenv";
import { openai, useTool } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const { tool, result } = await useTool({
    model: openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    tool: calculator,
    prompt: [openai.ChatMessage.user("What's fourteen times twelve?")],
    logging: "detailed-object",
  });
}

main().catch(console.error);
