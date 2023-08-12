import { FunctionOptions } from "../model-function/FunctionOptions.js";
import { Tool } from "./Tool.js";

export async function executeTool<
  INPUT,
  OUTPUT,
  TOOL extends Tool<string, INPUT, OUTPUT>,
>(
  tool: TOOL,
  input: INPUT,
  options?: FunctionOptions<undefined>
): Promise<OUTPUT> {
  return await tool.execute(input, options);
}
