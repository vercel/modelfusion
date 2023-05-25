export type GenerateCall = {
  type: "generate";
  input: unknown;
  metadata: {
    id?: string | undefined;
    model: {
      vendor: string;
      name: string;
    };
    startEpochSeconds: number;
    durationInMs: number;
    tries: number;
  };
} & (
  | { success: true; rawOutput: unknown; extractedOutput: unknown }
  | { success: false; error: unknown }
);
