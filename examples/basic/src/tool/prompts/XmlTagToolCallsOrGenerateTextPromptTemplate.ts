import {
  InstructionPrompt,
  ToolCallsOrGenerateTextPromptTemplate,
  ToolDefinition,
  parseJSON,
  zodSchema,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";

const DEFAULT_TAG_NAME = "functioncall";
const DEFAULT_INSTRUCTION_PREFIX =
  "You have access to the following functions:\n";
const DEFAULT_INSTRUCTION = (tagName: string) =>
  `\nTo use these functions respond with a JSON object inside <${tagName}> XML tags:\n` +
  `<${tagName}> { "name": functionName, "args": functionArgs } </${tagName}>`;

export const XmlTagToolCallsOrGenerateTextPromptTemplate = {
  text: ({
    tagName,
    generateId,
    instructionPrefix,
    instruction,
    instructionSuffix,
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
        system: createSystemPrompt({
          tools,
          tagName,
          instructionPrefix,
          instruction,
          instructionSuffix,
        }),
        instruction: prompt,
      };
    },

    extractToolCallsAndText(response: string) {
      return parseToolCallAndText({ response, tagName, generateId });
    },
  }),

  instruction: ({
    tagName,
    generateId,
    instructionPrefix,
    instruction,
    instructionSuffix,
  }: {
    tagName?: string;
    generateId?: () => string;
    instructionPrefix?: string;
    instruction?: string;
    instructionSuffix?: string;
  } = {}): ToolCallsOrGenerateTextPromptTemplate<
    InstructionPrompt,
    InstructionPrompt
  > => ({
    createPrompt(
      prompt: InstructionPrompt,
      tools: Array<ToolDefinition<string, unknown>>
    ) {
      return {
        system: createSystemPrompt({
          originalSystemPrompt: prompt.system,
          tools,
          tagName,
          instructionPrefix,
          instruction,
          instructionSuffix,
        }),
        instruction: prompt.instruction,
      };
    },

    extractToolCallsAndText(response: string) {
      return parseToolCallAndText({ response, tagName, generateId });
    },
  }),
};

function createSystemPrompt({
  tools,
  originalSystemPrompt,
  tagName = DEFAULT_TAG_NAME,
  instructionPrefix = DEFAULT_INSTRUCTION_PREFIX,
  instruction = DEFAULT_INSTRUCTION(tagName),
  instructionSuffix,
}: {
  tools: Array<ToolDefinition<string, unknown>>;
  originalSystemPrompt?: string;
  tagName?: string;
  instructionPrefix?: string;
  instruction?: string;
  instructionSuffix?: string;
}) {
  return [
    originalSystemPrompt,
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
  ]
    .filter(Boolean)
    .join("\n");
}

function parseToolCallAndText({
  response,
  tagName = DEFAULT_TAG_NAME,
  generateId = nanoid,
}: {
  response: string;
  tagName?: string;
  generateId?: () => string;
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
