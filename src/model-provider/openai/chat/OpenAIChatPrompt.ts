import SecureJSON from "secure-json-parse";
import { FunctionDescription } from "../../../model-function/generate-json/FunctionDescription.js";
import { JsonOrTextGenerationPrompt } from "../../../model-function/generate-json/JsonOrTextGenerationModel.js";
import { Tool } from "../../../tool/Tool.js";
import { OpenAIChatMessage } from "./OpenAIChatMessage.js";
import { OpenAIChatResponse } from "./OpenAIChatModel.js";

// In this file, using 'any' is required to allow for flexibility in the inputs. The actual types are
// retrieved through lookups such as TOOL["name"], such that any does not affect any client.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const OpenAIChatFunctionPrompt = {
  forFunction<STRUCTURE>(options: {
    messages: OpenAIChatMessage[];
    fn: FunctionDescription<string, STRUCTURE>;
  }) {
    return new OpenAIChatSingleFunctionPrompt(options);
  },

  forFunctionCurried<STRUCTURE>(messages: OpenAIChatMessage[]) {
    return (functionDescription: FunctionDescription<any, STRUCTURE>) =>
      this.forFunction({
        messages,
        fn: functionDescription,
      });
  },

  forTool<INPUT, OUTPUT>({
    messages,
    tool,
  }: {
    messages: OpenAIChatMessage[];
    tool: Tool<any, INPUT, OUTPUT>;
  }) {
    return this.forFunction({
      messages,
      fn: tool,
    });
  },

  forToolCurried<INPUT, OUTPUT>(messages: OpenAIChatMessage[]) {
    return (tool: Tool<any, INPUT, OUTPUT>) => this.forTool({ messages, tool });
  },

  forFunctions<FUNCTIONS extends Array<FunctionDescription<any, any>>>({
    messages,
    functions,
  }: {
    messages: OpenAIChatMessage[];
    functions: FUNCTIONS;
  }) {
    return new OpenAIChatAutoFunctionPrompt({
      messages,
      fns: functions.map((fn) => ({
        name: fn.name,
        description: fn.description,
        parameters: fn.parameters,
      })),
    });
  },

  forFunctionsCurried<FUNCTIONS extends Array<FunctionDescription<any, any>>>(
    messages: OpenAIChatMessage[]
  ) {
    return (functions: FUNCTIONS) =>
      this.forFunctions({ messages, functions: functions });
  },

  forTools<TOOLS extends Array<Tool<any, any, any>>>({
    messages,
    tools,
  }: {
    messages: OpenAIChatMessage[];
    tools: TOOLS;
  }) {
    return this.forFunctions({
      messages,
      functions: tools as Tool<any, any, any>[],
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
  readonly fn: FunctionDescription<string, FUNCTION>;

  constructor({
    messages,
    fn,
  }: {
    messages: OpenAIChatMessage[];
    fn: FunctionDescription<string, FUNCTION>;
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
  FUNCTIONS extends Array<FunctionDescription<string, any>>,
> implements JsonOrTextGenerationPrompt<OpenAIChatResponse>
{
  private readonly fns: FUNCTIONS;

  readonly messages: OpenAIChatMessage[];

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

  extractJsonAndText(response: OpenAIChatResponse) {
    const message = response.choices[0]!.message;
    const content = message.content;
    const functionCall = message.function_call;

    return functionCall == null
      ? {
          schema: null,
          value: null,
          text: content ?? "",
        }
      : {
          schema: functionCall.name,
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
