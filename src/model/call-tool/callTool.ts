import { FunctionOptions } from "../FunctionOptions.js";
import {
  JsonGenerationModel,
  JsonGenerationModelSettings,
  JsonGenerationPrompt,
} from "../generate-json/JsonGenerationModel.js";
import { generateJson } from "../generate-json/generateJson.js";
import { z } from "zod";

export async function callTool<
  PROMPT,
  RESPONSE,
  SETTINGS extends JsonGenerationModelSettings,
  INPUT,
  OUTPUT
>(
  model: JsonGenerationModel<PROMPT, RESPONSE, SETTINGS>,
  // TODO restructure
  tool: Tool<INPUT, OUTPUT>,
  prompt: (
    tool: Tool<INPUT, OUTPUT>
  ) => PROMPT & JsonGenerationPrompt<RESPONSE, INPUT>,
  options?: FunctionOptions<SETTINGS>
): Promise<OUTPUT> {
  return tool.run(await generateJson(model, prompt(tool), options));
}

export interface Tool<INPUT, OUTPUT> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<INPUT>;
  run(input: INPUT): Promise<OUTPUT>;
}
