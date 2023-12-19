import dotenv from "dotenv";
import { openai, useTool } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const { tool, result } = await useTool(
    openai.ChatTextGenerator({ model: "gpt-3.5-turbo" }),
    calculator,
    [openai.ChatMessage.user("What's fourteen times twelve?")],
    { logging: "detailed-object" }
  );
}

main().catch(console.error);
