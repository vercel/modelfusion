import SecureJSON from "secure-json-parse";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "composed-function/call-tool/Tool.js";
import { JsonGenerationPrompt } from "../../../model-function/generate-json/JsonGenerationModel.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatModel.js";

export const OpenAIChatFunctionPrompt = {
  forSingleTool<INPUT, OUTPUT>(messages: OpenAIChatMessage[]) {
    return (tool: Tool<INPUT, OUTPUT>) =>
      new OpenAIChatSingleFunctionPrompt({
        messages,
        fn: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      });
  },

  forToolChoice<TOOLS extends Record<string, Tool<any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (tools: TOOLS) => {
      const fns: Record<string, OpenAIFunctionDescription<any>> = {};

      for (const [name, tool] of Object.entries(tools)) {
        fns[name] = {
          description: tool.description,
          parameters: tool.inputSchema,
        };
      }

      return new OpenAIChatAutoFunctionPrompt({
        messages,
        fns,
      });
    };
  },

  forSingleFunction<T>(options: {
    messages: OpenAIChatMessage[];
    fn: {
      name: string;
      description?: string;
      parameters: z.Schema<T>;
    };
  }) {
    return new OpenAIChatSingleFunctionPrompt<T>(options);
  },

  forFunctionChoice<
    T extends Record<string, OpenAIFunctionDescription<any>>
  >(options: { messages: OpenAIChatMessage[]; fns: T }) {
    return new OpenAIChatAutoFunctionPrompt<T>(options);
  },
};

export class OpenAIChatSingleFunctionPrompt<T>
  implements JsonGenerationPrompt<OpenAIChatResponse, T>
{
  readonly messages: OpenAIChatMessage[];
  readonly fn: {
    readonly name: string;
    readonly description?: string;
    readonly parameters: z.Schema<T>;
  };

  constructor({
    messages,
    fn,
  }: {
    messages: OpenAIChatMessage[];
    fn: {
      name: string;
      description?: string;
      parameters: z.Schema<T>;
    };
  }) {
    this.messages = messages;
    this.fn = fn;
  }

  extractJson(response: OpenAIChatResponse): T {
    const jsonText = response.choices[0]!.message.function_call!.arguments;
    return this.fn.parameters.parse(SecureJSON.parse(jsonText));
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

type OpenAIFunctionDescription<T> = {
  description?: string;
  parameters: z.Schema<T>;
};

type OpenAIFunctionsTransform<T> = {
  [K in keyof T]: T[K] extends OpenAIFunctionDescription<infer U> ? U : never;
};

type KeyValuePair<T> = { [K in keyof T]: { fnName: K; value: T[K] } }[keyof T];

export class OpenAIChatAutoFunctionPrompt<
  T extends Record<string, OpenAIFunctionDescription<any>>
> implements
    JsonGenerationPrompt<
      OpenAIChatResponse,
      | { fnName: null; value: string }
      | KeyValuePair<OpenAIFunctionsTransform<T>>
    >
{
  readonly messages: OpenAIChatMessage[];

  readonly fns: T;

  constructor({ messages, fns }: { messages: OpenAIChatMessage[]; fns: T }) {
    this.messages = messages;
    this.fns = fns;
  }

  extractJson(
    response: OpenAIChatResponse
  ):
    | { fnName: null; value: string }
    | KeyValuePair<OpenAIFunctionsTransform<T>> {
    const message = response.choices[0]!.message;
    const functionCall = message.function_call;

    if (functionCall == null) {
      return {
        fnName: null,
        value: message.content!,
      };
    }

    const json = SecureJSON.parse(functionCall!.arguments);

    const fn = this.fns[functionCall.name];

    if (fn == null) {
      throw new Error(
        `Unexpected function call name: ${
          functionCall.name
        }. Expected one of ${Object.keys(this.fns).join(", ")}.`
      );
    }

    return {
      fnName: functionCall.name,
      value: fn.parameters.parse(json),
    };
  }

  get functionCall() {
    return "auto" as const;
  }

  get functions() {
    return Object.entries(this.fns).map(([name, fn]) => ({
      name,
      description: fn.description,
      parameters: zodToJsonSchema(fn.parameters),
    }));
  }
}
