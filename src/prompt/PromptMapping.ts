export interface PromptMapping<S, T> {
  map(source: S): T;
  stopTokens: string[];
}
