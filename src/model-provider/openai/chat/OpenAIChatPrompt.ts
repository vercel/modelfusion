import SecureJSON from "secure-json-parse";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "../../../composed-function/use-tool/Tool.js";
import { GenerateJsonPrompt } from "../../../model-function/generate-json/GenerateJsonModel.js";
import { GenerateJsonOrTextPrompt } from "../../../model-function/generate-json/GenerateJsonOrTextModel.js";
import { SchemaDefinition } from "../../../model-function/generate-json/SchemaDefinition.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatModel.js";

export type OpenAIFunctionDescription<T> = {
  name: string;
  description?: string;
  parameters: z.Schema<T>;
};

export const OpenAIChatFunctionPrompt = {
  forOpenAIFunctionDescription<T>(options: {
    messages: OpenAIChatMessage[];
    fn: OpenAIFunctionDescription<T>;
  }) {
    return new OpenAIChatSingleFunctionPrompt(options);
  },

  forSchema<STRUCTURE>({
    messages,
    schemaDefinition,
  }: {
    messages: OpenAIChatMessage[];
    schemaDefinition: SchemaDefinition<any, STRUCTURE>;
  }) {
    return this.forOpenAIFunctionDescription({
      messages,
      fn: {
        name: schemaDefinition.name,
        description: schemaDefinition.description,
        parameters: schemaDefinition.schema,
      },
    });
  },

  forSchemaCurried<STRUCTURE>(messages: OpenAIChatMessage[]) {
    return (schemaDefinition: SchemaDefinition<any, STRUCTURE>) =>
      this.forSchema({
        messages,
        schemaDefinition,
      });
  },

  forTool<INPUT, OUTPUT>({
    messages,
    tool,
  }: {
    messages: OpenAIChatMessage[];
    tool: Tool<any, INPUT, OUTPUT>;
  }) {
    return this.forSchema({
      messages,
      schemaDefinition: tool.inputSchemaDefinition,
    });
  },

  forToolCurried<INPUT, OUTPUT>(messages: OpenAIChatMessage[]) {
    return (tool: Tool<any, INPUT, OUTPUT>) => this.forTool({ messages, tool });
  },

  forOpenAIFunctionDescriptions<
    FUNCTIONS extends Array<OpenAIFunctionDescription<any>>
  >(options: { messages: OpenAIChatMessage[]; fns: FUNCTIONS }) {
    return new OpenAIChatAutoFunctionPrompt(options);
  },

  forSchemas<SCHEMAS extends Array<SchemaDefinition<any, any>>>({
    messages,
    schemaDefinitions,
  }: {
    messages: OpenAIChatMessage[];
    schemaDefinitions: SCHEMAS;
  }) {
    return this.forOpenAIFunctionDescriptions({
      messages,
      fns: schemaDefinitions.map((schemaDefinition) => ({
        name: schemaDefinition.name,
        description: schemaDefinition.description,
        parameters: schemaDefinition.schema,
      })),
    });
  },

  forSchemasCurried<SCHEMAS extends Array<SchemaDefinition<any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (schemaDefinitions: SCHEMAS) =>
      this.forSchemas({ messages, schemaDefinitions });
  },

  forTools<TOOLS extends Array<Tool<any, any, any>>>({
    messages,
    tools,
  }: {
    messages: OpenAIChatMessage[];
    tools: TOOLS;
  }) {
    return this.forSchemas({
      messages,
      schemaDefinitions: tools.map((tool) => tool.inputSchemaDefinition),
    });
  },

  forToolsCurried<TOOLS extends Array<Tool<any, any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (tools: TOOLS) => this.forTools({ messages, tools });
  },
};

export class OpenAIChatSingleFunctionPrompt<T>
  implements GenerateJsonPrompt<OpenAIChatResponse>
{
  readonly messages: OpenAIChatMessage[];
  readonly fn: OpenAIFunctionDescription<T>;

  constructor({
    messages,
    fn,
  }: {
    messages: OpenAIChatMessage[];
    fn: OpenAIFunctionDescription<T>;
  }) {
    this.messages = messages;
    this.fn = fn;
  }

  extractJson(response: OpenAIChatResponse) {
    const jsonText = response.choices[0]!.message.function_call!.arguments;
    return SecureJSON.parse(jsonText);
  }

  get functionCall() {
    return { name: this.fn.name };
  }

  get functions() {
    return [
      {
        name: this.fn.name,
        description: this.fn.description,
        parameters: zodToJsonSchema(this.fn.parameters),
      },
    ];
  }
}

export class OpenAIChatAutoFunctionPrompt<
  FUNCTIONS extends Array<OpenAIFunctionDescription<any>>
> implements GenerateJsonOrTextPrompt<OpenAIChatResponse>
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

  extractJson(response: OpenAIChatResponse) {
    const message = response.choices[0]!.message;
    const functionCall = message.function_call;

    return functionCall == null
      ? {
          schema: null,
          value: message.content ?? "",
        }
      : {
          schema: functionCall.name,
          value: SecureJSON.parse(functionCall.arguments),
        };
  }

  get functionCall() {
    return "auto" as const;
  }

  get functions() {
    return this.fns.map((fn) => ({
      name: fn.name,
      description: fn.description,
      parameters: zodToJsonSchema(fn.parameters),
    }));
  }
}
