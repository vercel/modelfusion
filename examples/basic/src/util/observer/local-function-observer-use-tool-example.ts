import dotenv from "dotenv";
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  useTool,
} from "modelfusion";
import { calculator } from "../../tool/calculator-tool";
import { customObserver } from "./custom-observer";

dotenv.config();

(async () => {
  // Set the observer on the function call:
  const { tool, parameters, result } = await useTool(
    new OpenAIChatModel({ model: "gpt-3.5-turbo" }),
    calculator,
    OpenAIChatFunctionPrompt.forToolCurried([
      OpenAIChatMessage.user("What's fourteen times twelve?"),
    ]),
    { observers: [customObserver] }
  );
})();
