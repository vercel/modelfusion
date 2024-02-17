import { Command } from "commander";
import dotenv from "dotenv";
import { DefaultRun, withRun } from "modelfusion";
import {
  OpenAICostCalculator,
  calculateCost,
} from "@modelfusion/cost-calculator";
import { createTweetFromPdf } from "./createTweetFromPdf";

dotenv.config();

const program = new Command();

program
  .description("Create Twitter thread from PDF file")
  .requiredOption("-f, --file <value>", "Path to PDF file")
  .requiredOption("-e, --examples <value>", "Path to example tweet index")
  .requiredOption("-t, --topic <value>", "Topic")
  .parse(process.argv);

const { file, topic, examples } = program.opts();

const run = new DefaultRun({
  observers: [
    {
      onFunctionEvent(event) {
        switch (event.functionType) {
          case "generate-text": {
            console.log(
              `Generate text ${event.functionId ?? "unknown"} ${
                event.functionType
              }.`
            );
            break;
          }
          case "embed": {
            console.log(
              `Embed text ${event.functionId ?? "unknown"} ${
                event.functionType
              }.`
            );
            break;
          }
        }
      },
    },
  ],
});

withRun(run, async () => {
  createTweetFromPdf({
    topic,
    pdfPath: file,
    exampleTweetIndexPath: examples,
  })
    .then(async (result) => {
      const cost = await calculateCost({
        calls: run.getSuccessfulModelCalls(),
        costCalculators: [new OpenAICostCalculator()],
      });

      console.log();
      console.log(result);
      console.log();
      console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
    })
    .catch((error) => {
      console.error(error);
    });
});
