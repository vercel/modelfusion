import { nanoid } from "nanoid";
import { z } from "zod";
import { zodSchema } from "../../core/schema/ZodSchema.js";
import { parseJSON } from "../../core/schema/parseJSON.js";
import { InstructionPrompt } from "../../model-function/generate-text/prompt-template/InstructionPrompt.js";
import { ToolDefinition } from "../ToolDefinition.js";
import { ToolCallsOrGenerateTextPromptTemplate } from "./ToolCallsOrGenerateTextPromptTemplate.js";

export const XmlTagToolCallsOrGenerateTextPromptTemplate = {
  text: ({
    tagName = "functioncall",
    generateId = nanoid,
    instructionPrefix = "You have access to the following functions:\n",
    instruction = `\nTo use these functions respond with a JSON object inside <${tagName}> XML tags:\n` +
      `<${tagName}> { "name": functionName, "args": functionArgs } </${tagName}>`,
    instructionSuffix = "",
  }: {
    tagName?: string;
    generateId?: () => string;
    instructionPrefix?: string;
    instruction?: string;
    instructionSuffix?: string;
  } = {}): ToolCallsOrGenerateTextPromptTemplate<
    string,
    InstructionPrompt
  > => ({
    createPrompt(
      prompt: string,
      tools: Array<ToolDefinition<string, unknown>>
    ) {
      return {
        system: [
          instructionPrefix,
          ...tools.map((tool) =>
            JSON.stringify({
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters.getJsonSchema(),
            })
          ),
          instruction,
          instructionSuffix,
        ].join("\n"),
        instruction: prompt,
      };
    },

    extractToolCallsAndText(response: string) {
      return parseToolCallAndText({
        response,
        tagName,
        generateId,
      });
    },
  }),
};

function parseToolCallAndText({
  response,
  tagName,
  generateId,
}: {
  response: string;
  tagName: string;
  generateId: () => string;
}) {
  const functionCallStart = response.indexOf(`<${tagName}>`);
  const functionCallEnd = response.indexOf(`</${tagName}>`);

  if (
    functionCallStart === -1 ||
    functionCallEnd === -1 ||
    functionCallEnd < functionCallStart
  ) {
    return {
      text: response,
      toolCalls: [],
    };
  }

  // extract function call:
  const functionCall = response.slice(
    functionCallStart + `<${tagName}>`.length,
    functionCallEnd
  );

  // parse function call:
  const functionCallJson = parseJSON({
    text: functionCall,
    schema: zodSchema(z.object({ name: z.string(), args: z.any() })),
  });

  // extract text before and after function call, concatenate and trim:
  const text = response
    .slice(0, functionCallStart)
    .concat(response.slice(functionCallEnd + `</${tagName}>`.length))
    .trim();

  return {
    text: text.length > 0 ? text : null,
    toolCalls: [
      {
        id: generateId(),
        name: functionCallJson.name,
        args: functionCallJson.args,
      },
    ],
  };
}
