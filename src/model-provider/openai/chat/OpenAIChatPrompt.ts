import SecureJSON from "secure-json-parse";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "../../../composed-function/call-tool/Tool.js";
import { JsonGenerationPrompt } from "../../../model-function/generate-json/JsonGenerationModel.js";
import { SchemaDefinition } from "../../../model-function/generate-json/generateJson.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatModel.js";

export const OpenAIChatFunctionPrompt = {
  forSingleTool<INPUT, OUTPUT>(messages: OpenAIChatMessage[]) {
    return (tool: Tool<any, INPUT, OUTPUT>) =>
      new OpenAIChatSingleFunctionPrompt({
        messages,
        fn: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      });
  },

  forToolChoice<TOOLS extends Array<Tool<any, any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (tools: TOOLS) => {
      const fns: Array<OpenAIFunctionDescription<any>> = [];

      for (const tool of tools) {
        fns.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        });
      }

      return new OpenAIChatAutoFunctionPrompt({
        messages,
        fns,
      });
    };
  },

  forSchema<STRUCTURE>(messages: OpenAIChatMessage[]) {
    return (schemaDefinition: SchemaDefinition<any, STRUCTURE>) =>
      new OpenAIChatSingleFunctionPrompt({
        messages,
        fn: {
          name: schemaDefinition.name,
          description: schemaDefinition.description,
          parameters: schemaDefinition.schema,
        },
      });
  },

  forTextOrSchemas<SCHEMAS extends Array<SchemaDefinition<any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (schemaDefinitions: SCHEMAS) =>
      new OpenAIChatAutoFunctionPrompt({
        messages,
        fns: schemaDefinitions.map((schemaDefinition) => ({
          name: schemaDefinition.name,
          description: schemaDefinition.description,
          parameters: schemaDefinition.schema,
        })),
      });
  },
};

export type OpenAIFunctionDescription<T> = {
  name: string;
  description?: string;
  parameters: z.Schema<T>;
};

export class OpenAIChatSingleFunctionPrompt<T>
  implements JsonGenerationPrompt<OpenAIChatResponse>
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
    const json = SecureJSON.parse(jsonText);

    return {
      fnName: this.fn.name,
      json,
    };
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
> implements JsonGenerationPrompt<OpenAIChatResponse>
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
          fnName: null,
          json: message.content,
        }
      : {
          fnName: functionCall.name,
          json: SecureJSON.parse(functionCall.arguments),
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
