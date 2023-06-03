export type OpenAIChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};
