export type Prompt<INPUT, PROMPT_TYPE> = (
  input: INPUT
) => PromiseLike<PROMPT_TYPE>;
