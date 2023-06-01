import { Command } from "commander";
import dotenv from "dotenv";
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

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

createTweetFromPdf({
  topic,
  pdfPath: file,
  exampleTweetIndexPath: examples,
  openAiApiKey,
  context: {
    onCallStart: (call) => {
      console.log(`${call.metadata.functionId ?? "unknown"} started.`);
    },
    onCallEnd: (call) => {
      console.log(`${call.metadata.functionId ?? "unknown"} finished.`);
    },
  },
})
  .then((result) => {
    console.log();
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
