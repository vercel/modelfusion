export type PromptTemplate<INPUT, PROMPT> = (
  input: INPUT
) => PromiseLike<PROMPT>;
