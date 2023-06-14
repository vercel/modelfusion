export type OpenAIChatMessage = {
  content: string;
  function_call?: any;
} & (
  | {
      role: "user" | "assistant" | "system";
      name?: string;
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

  func(name: string, content: string): OpenAIChatMessage {
    return { role: "function", name, content };
  },
};
