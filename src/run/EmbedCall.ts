export type EmbedCall = {
  type: "embed";
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
  | { success: true; rawOutput: unknown; embedding: unknown }
  | { success: false; error: unknown }
);
