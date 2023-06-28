import { Command } from "commander";
import dotenv from "dotenv";
import { createTweetFromPdf } from "./createTweetFromPdf";
import {
  CostCalculator,
  ModelCallFinishedEvent,
  OpenAICostCalculator,
} from "ai-utils.js";

dotenv.config();

const program = new Command();

program
  .description("Create Twitter thread from PDF file")
  .requiredOption("-f, --file <value>", "Path to PDF file")
  .requiredOption("-e, --examples <value>", "Path to example tweet index")
  .requiredOption("-t, --topic <value>", "Topic")
  .parse(process.argv);

const { file, topic, examples } = program.opts();

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

const modelCalls: ModelCallFinishedEvent[] = [];

createTweetFromPdf({
  topic,
  pdfPath: file,
  exampleTweetIndexPath: examples,
  openAiApiKey,
  run: {
    observers: [
      {
        onModelCallStarted(event) {
          if (event.type === "text-generation-started") {
            console.log(
              `Generate text ${event.metadata.functionId ?? "unknown"} started.`
            );
          } else if (event.type === "text-embedding-started") {
            console.log(
              `Embed text ${event.metadata.functionId ?? "unknown"} started.`
            );
          }
        },

        onModelCallFinished(event) {
          modelCalls.push(event);

          if (event.type === "text-generation-finished") {
            console.log(
              `Generate text ${
                event.metadata.functionId ?? "unknown"
              } finished.`
            );
          } else if (event.type === "text-embedding-finished") {
            console.log(
              `Embed text ${event.metadata.functionId ?? "unknown"} finished.`
            );
          }
        },
      },
    ],
  },
})
  .then(async (result) => {
    const costCalculator = new CostCalculator({
      providerCostCalculators: [new OpenAICostCalculator()],
    });

    const cost = await costCalculator.calculateCostInMillicent(modelCalls);

    console.log();
    console.log(result);
    console.log();
    console.log(`Cost: ${cost.formatAsDollarAmount({ decimals: 4 })}`);
  })
  .catch((error) => {
    console.error(error);
  });
