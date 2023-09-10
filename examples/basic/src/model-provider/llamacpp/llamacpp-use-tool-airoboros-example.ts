import dotenv from "dotenv";
import {
  InstructionWithFunctionPrompt,
  JsonTextGenerationModel,
  LlamaCppTextGenerationModel,
  FunctionDescription,
  useTool,
} from "modelfusion";
import SecureJSON from "secure-json-parse";
import { z } from "zod";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

// schema is specific to airoboros prompt
const airoborosFunctionSchema = z.object({
  function: z.string(),
  params: z.any(),
});

// Prompt for Airoboros L2 13B GPT4 2.0:
// https://huggingface.co/TheBloke/airoboros-l2-13b-gpt4-2.0-GGML
class AiroborosFunctionPromptFormat<STRUCTURE> {
  readonly prefix = `{`;

  createPrompt({
    fn,
    instruction,
  }: {
    fn: FunctionDescription<any, STRUCTURE>;
    instruction: string;
  }): string {
    // map parameters JSON schema
    const properties: Record<string, { type: string; description: string }> = (
      fn.parameters.getJsonSchema() as any
    ).properties;

    return [
      `As an AI assistant, please select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${fn.name}:`,
      `  description: ${fn.description ?? ""}`,
      `  params:`,
      // Note: Does support nested schemas yet
      ...Object.entries(properties).map(
        ([name, { type, description }]) =>
          `    ${name}: (${type}) ${description}`
      ),
      ``,
      `Input: ${instruction}`,
      ``,
      `Response: ${this.prefix}`,
    ].join("\n");
  }

  extractJson(response: string): unknown {
    const json = SecureJSON.parse(this.prefix + response);
    return airoborosFunctionSchema.parse(json).params;
  }
}

async function main() {
  const { tool, parameters, result } = await useTool(
    new JsonTextGenerationModel({
      model: new LlamaCppTextGenerationModel({
        maxCompletionTokens: 1024,
        temperature: 0,
        contextWindowSize: 2048,
      }),
      format: new AiroborosFunctionPromptFormat(),
    }),
    calculator,
    InstructionWithFunctionPrompt.forToolCurried(
      "What's fourteen times twelve?"
    )
  );

  console.log(`Tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
