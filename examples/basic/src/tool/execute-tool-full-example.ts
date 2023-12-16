import dotenv from "dotenv";
import { executeTool } from "modelfusion";
import { calculator } from "./tools/calculator-tool";

dotenv.config();

async function main() {
  const { metadata, output } = await executeTool(
    calculator,
    {
      a: 14,
      b: 12,
      operator: "*" as const,
    },
    { fullResponse: true }
  );

  console.log(`Result: ${output}`);
  console.log(`Duration: ${metadata.durationInMs}ms`);
}

main().catch(console.error);
