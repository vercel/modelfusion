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
  | { status: "success"; rawOutput: unknown; extractedOutput: unknown }
  | { status: "failure"; error: unknown }
  | { status: "abort" }
);
