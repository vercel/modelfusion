import dotenv from "dotenv";
import { executeTool } from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

async function main() {
  const result = await executeTool(calculator, {
    a: 14,
    b: 12,
    operator: "*" as const,
  });

  console.log(`Result: ${result}`);
}

main().catch(console.error);
