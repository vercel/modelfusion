import { Command } from "commander";
import dotenv from "dotenv";
import { DefaultRun, OpenAICostCalculator } from "modelfusion";
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
  costCalculators: [new OpenAICostCalculator()],
  observers: [
    {
      onFunctionEvent(event) {
        switch (event.type) {
          case "text-generation-started": {
            console.log(
              `Generate text ${event.metadata.functionId ?? "unknown"} started.`
            );
            break;
          }
          case "text-generation-finished": {
            console.log(
              `Generate text ${
                event.metadata.functionId ?? "unknown"
              } finished.`
            );
            break;
          }
          case "text-embedding-started": {
            console.log(
              `Embed text ${event.metadata.functionId ?? "unknown"} started.`
            );
            break;
          }
          case "text-embedding-finished": {
            console.log(
              `Embed text ${event.metadata.functionId ?? "unknown"} finished.`
            );
            break;
          }
        }
      },
    },
  ],
});

createTweetFromPdf({
  topic,
  pdfPath: file,
  exampleTweetIndexPath: examples,
  run,
})
  .then(async (result) => {
    const cost = await run.calculateCost();

    console.log();
    console.log(result);
    console.log();
    console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
  })
  .catch((error) => {
    console.error(error);
  });
