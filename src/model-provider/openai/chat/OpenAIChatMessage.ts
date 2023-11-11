export type OpenAIChatMessage =
  | {
      role: "system";
      content: string;
      name?: string;
    }
  | {
      role: "user";
      content:
        | string
        | Array<
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: string }
          >;
      name?: string;
    }
  | {
      role: "assistant";
      content: string | null;
      name?: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
      function_call?: {
        name: string;
        arguments: string;
      };
    }
  | {
      role: "tool";
      tool_call_id: string;
      content: string | null;
    }
  | {
      role: "function";
      content: string;
      name: string;
    };

export const OpenAIChatMessage = {
  system(content: string): OpenAIChatMessage {
    return { role: "system", content };
  },

  user(content: string): OpenAIChatMessage {
    return { role: "user", content };
  },

  assistant(content: string): OpenAIChatMessage {
    return { role: "assistant", content };
  },

  functionCall(
    content: string | null,
    functionCall: {
      name: string;
      arguments: string;
    }
  ): OpenAIChatMessage {
    return {
      role: "assistant",
      content,
      function_call: functionCall,
    };
  },

  functionResult(name: string, content: string): OpenAIChatMessage {
    return { role: "function", name, content };
  },

  /**
   * Creates a function call chat message for tool calls.
   */
  toolCall({
    text,
    tool,
    parameters,
  }: {
    text: string | null;
    tool: string;
    parameters: unknown;
  }) {
    return {
      role: "assistant" as const,
      content: text,
      function_call: {
        name: tool,
        arguments: JSON.stringify(parameters),
      },
    };
  },

  /**
   * Creates a function result chat message for tool call results.
   */
  toolResult({ tool, result }: { tool: string; result: unknown }) {
    return {
      role: "function" as const,
      name: tool,
      content: JSON.stringify(result),
    };
  },
};
