import dotenv from "dotenv";
import { executeTool } from "modelfusion";
import { calculator } from "./tools/calculator-tool";

dotenv.config();

async function main() {
  const result = await executeTool({
    tool: calculator,
    args: { a: 14, b: 12, operator: "*" },
  });

  console.log(`Result: ${result}`);
}

main().catch(console.error);
