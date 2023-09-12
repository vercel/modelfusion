import dotenv from "dotenv";
import {
  OpenAIChatMessage,
  OpenAIChatModel,
  useToolOrGenerateText,
} from "modelfusion";
import { calculator } from "./calculator-tool";

dotenv.config();

async function main() {
  const { tool, parameters, result, text } = await useToolOrGenerateText(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    [calculator /* ... */],
    [OpenAIChatMessage.user("What's fourteen times twelve?")]
  );

  console.log(tool != null ? `TOOL: ${tool}` : "TEXT");
  console.log(`PARAMETERS: ${JSON.stringify(parameters)}`);
  console.log(`TEXT: ${text}`);
  console.log(`RESULT: ${JSON.stringify(result)}`);
}

main().catch(console.error);
