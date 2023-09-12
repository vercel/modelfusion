import dotenv from "dotenv";
import { OpenAIChatMessage, OpenAIChatModel, useTool } from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

async function main() {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const { tool, parameters, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    [OpenAIChatMessage.user("What's fourteen times twelve?")],
    { logging: "detailed-object" }
  );
}

main().catch(console.error);
