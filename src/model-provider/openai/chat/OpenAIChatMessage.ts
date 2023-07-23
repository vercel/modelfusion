export type OpenAIChatMessage = {
  content: string;
} & (
  | {
      role: "user" | "assistant" | "system";
      name?: string;
    }
  | {
      role: "assistant";
      function_call: {
        name: string;
        arguments: string;
      };
    }
  | {
      role: "function";
      name: string;
    }
);

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

  functionCall(functionCall: {
    name: string;
    arguments: string;
  }): OpenAIChatMessage {
    return { role: "assistant", content: "", function_call: functionCall };
  },

  functionResult(name: string, content: string): OpenAIChatMessage {
    return { role: "function", name, content };
  },
};
