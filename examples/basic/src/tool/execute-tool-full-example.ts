import dotenv from "dotenv";
import { executeTool } from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

(async () => {
  const { metadata, output } = await executeTool(calculator, {
    a: 14,
    b: 12,
    operator: "*" as const,
  }).asFullResponse();

  console.log(`Result: ${output}`);
  console.log(`Duration: ${metadata.durationInMs}ms`);
})();
