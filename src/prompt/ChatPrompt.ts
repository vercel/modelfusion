export type ChatPrompt =
  | [{ user: string }]
  | [...Array<{ user: string; ai: string }>, { user: string }]
  | [{ system: string }, { user: string }]
  | [
      { system: string },
      ...Array<{ user: string; ai: string }>,
      { user: string },
    ];
