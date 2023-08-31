import dotenv from "dotenv";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  useTool,
} from "modelfusion";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

(async () => {
  console.log();
  console.log("Logging: detailed-object");
  console.log();

  const { tool, parameters, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    OpenAIChatFunctionPrompt.forToolCurried([
      OpenAIChatMessage.user("What's fourteen times twelve?"),
    ]),
    { logging: "detailed-object" }
  );
})();
