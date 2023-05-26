import { Command } from "commander";
import dotenv from "dotenv";
import { runBabyAGI } from "./runBabyAGI";

dotenv.config();

const program = new Command();

program
  .description("BabyAGI")
  .requiredOption("-o, --objective <value>", "Objective")
  .parse(process.argv);

const { objective } = program.opts();

const openAiApiKey = process.env.OPENAI_API_KEY;

if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

runBabyAGI({
  objective,
  firstTask: "Develop a task list.",
  openAiApiKey,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
