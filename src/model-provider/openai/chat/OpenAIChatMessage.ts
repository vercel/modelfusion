export type OpenAIChatMessage =
  // regular message:
  | {
      role: "user" | "assistant" | "system";
      content: string;
      name?: string;
    }
  // function invocation message:
  | {
      role: "assistant";
      content: string | null;
      function_call: {
        name: string;
        arguments: string;
      };
    }
  // function result message:
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
};
