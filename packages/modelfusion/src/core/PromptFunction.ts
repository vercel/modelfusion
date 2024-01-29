export type PromptFunction<INPUT, PROMPT> = (() => PromiseLike<{
  input: INPUT;
  prompt: PROMPT;
}>) & {
  [promptFunctionMarker]: true;
};

const promptFunctionMarker = Symbol("promptFunction");

/**
 * Expands a prompt into its full form if it is a PromptFunction, otherwise returns the prompt as is.
 * @param {PROMPT | PromptFunction<unknown, PROMPT>} prompt - The prompt to expand.
 * @returns {Promise<{input: unknown; prompt: PROMPT;}>} - The expanded prompt.
 */
export async function expandPrompt<PROMPT>(
  prompt: PROMPT | PromptFunction<unknown, PROMPT>
): Promise<{
  input: unknown;
  prompt: PROMPT;
}> {
  return isPromptFunction(prompt) ? await prompt() : { input: prompt, prompt };
}

/**
 * Marks a function as a PromptFunction by setting a unique symbol.
 * @param {() => PromiseLike<{input: INPUT; prompt: PROMPT;}>} fn - The function to mark.
 * @returns {PromptFunction<INPUT, PROMPT>} - The marked function.
 */
export function markAsPromptFunction<INPUT, PROMPT>(
  fn: () => PromiseLike<{
    input: INPUT;
    prompt: PROMPT;
  }>
): PromptFunction<INPUT, PROMPT> {
  // Set the promptFunctionMarker on the function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn as any)[promptFunctionMarker] = true;

  return fn as unknown as PromptFunction<INPUT, PROMPT>;
}

/**
 * Checks if a function is a PromptFunction by checking for the unique symbol.
 * @param {unknown} fn - The function to check.
 * @returns {boolean} - True if the function is a PromptFunction, false otherwise.
 */
export function isPromptFunction<INPUT, PROMPT>(
  fn: unknown
): fn is PromptFunction<INPUT, PROMPT> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasMarker = (fn as any)[promptFunctionMarker] === true;
  const isFunction = typeof fn === "function";

  return hasMarker && isFunction;
}
