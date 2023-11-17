export interface ToolCall<NAME extends string, PARAMETERS> {
  id: string;
  name: NAME;
  parameters: PARAMETERS;
}
