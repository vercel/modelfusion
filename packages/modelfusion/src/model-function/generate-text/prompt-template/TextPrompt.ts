import {
  PromptFunction,
  markAsPromptFunction,
} from "../../../core/PromptFunction";

export function createTextPrompt<INPUT>(
  promptFunction: (input: INPUT) => Promise<string>
): (input: INPUT) => PromptFunction<INPUT, string> {
  return (input: INPUT) =>
    markAsPromptFunction(async () => ({
      input,
      prompt: await promptFunction(input),
    }));
}
