import dotenv from "dotenv";
import { DefaultRun, executeTool, withRun } from "modelfusion";
import { calculator } from "../../tool/tools/calculator-tool";
import { customObserver } from "./custom-observer";

dotenv.config();

async function main() {
  // Set the observer on the run:
  const run = new DefaultRun({
    observers: [customObserver],
  });

  withRun(run, async () => {
    const result = await executeTool({
      tool: calculator,
      args: { a: 14, b: 12, operator: "*" },
    });
  });
}

main().catch(console.error);
