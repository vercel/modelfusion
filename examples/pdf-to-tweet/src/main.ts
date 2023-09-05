import { Command } from "commander";
import dotenv from "dotenv";
import { DefaultRun, OpenAICostCalculator, calculateCost } from "modelfusion";
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
          case "text-generation": {
            console.log(
              `Generate text ${event.functionId ?? "unknown"} ${
                event.functionType
              }.`
            );
            break;
          }
          case "text-embedding": {
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

createTweetFromPdf({
  topic,
  pdfPath: file,
  exampleTweetIndexPath: examples,
  run,
})
  .then(async (result) => {
    const cost = await calculateCost({
      calls: run.successfulModelCalls,
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
