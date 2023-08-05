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

runBabyAGI({
  objective,
  firstTask: "Develop a task list.",
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
