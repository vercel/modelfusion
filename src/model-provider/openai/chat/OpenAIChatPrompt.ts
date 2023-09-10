import SecureJSON from "secure-json-parse";
import { StructureOrTextGenerationPrompt } from "../../../model-function/generate-structure/StructureOrTextGenerationModel.js";
import { Schema } from "../../../model-function/generate-structure/Schema.js";
import { StructureDefinition } from "../../../model-function/generate-structure/StructureDefinition.js";
import { Tool } from "../../../tool/Tool.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatModel.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type OpenAIFunctionDescription<T> = {
  name: string;
  description?: string;
  parameters: Schema<T>;
};

export const OpenAIChatFunctionPrompt = {
  forOpenAIFunctionDescription<T>(options: {
    messages: OpenAIChatMessage[];
    fn: OpenAIFunctionDescription<T>;
  }) {
    return new OpenAIChatSingleFunctionPrompt(options);
  },

  forStructure<STRUCTURE>({
    messages,
    structure,
  }: {
    messages: OpenAIChatMessage[];
    structure: StructureDefinition<any, STRUCTURE>;
  }) {
    return this.forOpenAIFunctionDescription({
      messages,
      fn: {
        name: structure.name,
        description: structure.description,
        parameters: structure.schema,
      },
    });
  },

  forStructureCurried<STRUCTURE>(messages: OpenAIChatMessage[]) {
    return (structure: StructureDefinition<any, STRUCTURE>) =>
      this.forStructure({ messages, structure });
  },

  forTool<INPUT, OUTPUT>({
    messages,
    tool,
  }: {
    messages: OpenAIChatMessage[];
    tool: Tool<any, INPUT, OUTPUT>;
  }) {
    return this.forStructure({
      messages,
      structure: tool.inputStructureDefinition,
    });
  },

  forToolCurried<INPUT, OUTPUT>(messages: OpenAIChatMessage[]) {
    return (tool: Tool<any, INPUT, OUTPUT>) => this.forTool({ messages, tool });
  },

  forOpenAIFunctionDescriptions<
    FUNCTIONS extends Array<OpenAIFunctionDescription<any>>,
  >(options: { messages: OpenAIChatMessage[]; fns: FUNCTIONS }) {
    return new OpenAIChatAutoFunctionPrompt(options);
  },

  forStructures<STRUCTURES extends Array<StructureDefinition<any, any>>>({
    messages,
    structures,
  }: {
    messages: OpenAIChatMessage[];
    structures: STRUCTURES;
  }) {
    return this.forOpenAIFunctionDescriptions({
      messages,
      fns: structures.map((structure) => ({
        name: structure.name,
        description: structure.description,
        parameters: structure.schema,
      })),
    });
  },

  forStructuresCurried<STRUCTURE extends Array<StructureDefinition<any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (structures: STRUCTURE) =>
      this.forStructures({ messages, structures });
  },

  forTools<TOOLS extends Array<Tool<any, any, any>>>({
    messages,
    tools,
  }: {
    messages: OpenAIChatMessage[];
    tools: TOOLS;
  }) {
    return this.forStructures({
      messages,
      structures: tools.map((tool) => tool.inputStructureDefinition),
    });
  },

  forToolsCurried<TOOLS extends Array<Tool<any, any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (tools: TOOLS) => this.forTools({ messages, tools });
  },
};

export class OpenAIChatSingleFunctionPrompt<FUNCTION> {
  readonly messages: OpenAIChatMessage[];
  readonly fn: OpenAIFunctionDescription<FUNCTION>;

  constructor({
    messages,
    fn,
  }: {
    messages: OpenAIChatMessage[];
    fn: OpenAIFunctionDescription<FUNCTION>;
  }) {
    this.messages = messages;
    this.fn = fn;
  }

  get functionCall() {
    return { name: this.fn.name };
  }

  get functions() {
    return [
      {
        name: this.fn.name,
        description: this.fn.description,
        parameters: this.fn.parameters.getJsonSchema(),
      },
    ];
  }
}

export class OpenAIChatAutoFunctionPrompt<
  FUNCTIONS extends Array<OpenAIFunctionDescription<any>>,
> implements StructureOrTextGenerationPrompt<OpenAIChatResponse>
{
  readonly messages: OpenAIChatMessage[];

  readonly fns: FUNCTIONS;

  constructor({
    messages,
    fns,
  }: {
    messages: OpenAIChatMessage[];
    fns: FUNCTIONS;
  }) {
    this.messages = messages;
    this.fns = fns;
  }

  extractStructureAndText(response: OpenAIChatResponse) {
    const message = response.choices[0]!.message;
    const content = message.content;
    const functionCall = message.function_call;

    return functionCall == null
      ? {
          structure: null,
          value: null,
          text: content ?? "",
        }
      : {
          structure: functionCall.name,
          value: SecureJSON.parse(functionCall.arguments),
          text: content,
        };
  }

  get functionCall() {
    return "auto" as const;
  }

  get functions() {
    return this.fns.map((fn) => ({
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters.getJsonSchema(),
    }));
  }
}
