import dotenv from "dotenv";
import {
  LlamaCppTextGenerationModel,
  StructureDefinition,
  StructureFromTextGenerationModel,
  parseJsonWithZod,
  useTool,
} from "modelfusion";
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

  createPrompt(
    instruction: string,
    structure: StructureDefinition<any, STRUCTURE>
  ): string {
    // map parameters JSON schema
    const properties: Record<string, { type: string; description: string }> = (
      structure.schema.getJsonSchema() as any
    ).properties;

    return [
      `As an AI assistant, please select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${structure.name}:`,
      `  description: ${structure.description ?? ""}`,
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

  extractStructure(response: string): unknown {
    const json = parseJsonWithZod(
      this.prefix + response,
      airoborosFunctionSchema
    );

    return json.params;
  }
}

async function main() {
  const { tool, parameters, result } = await useTool(
    new StructureFromTextGenerationModel({
      model: new LlamaCppTextGenerationModel({
        maxCompletionTokens: 1024,
        temperature: 0,
        contextWindowSize: 2048,
      }).withTextPrompt(),
      format: new AiroborosFunctionPromptFormat(),
    }),
    calculator,
    "What's fourteen times twelve?"
  );

  console.log(`Tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  console.log(`Result: ${result}`);
}

main().catch(console.error);
