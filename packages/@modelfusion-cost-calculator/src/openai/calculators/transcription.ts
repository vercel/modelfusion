/**
 * @see https://openai.com/pricing
 */
export const TRANSCRIPTION_MODEL_COSTS = {
  "whisper-1": 10, // = 600 / 60,
};

export type OpenAITranscriptionModelType =
  keyof typeof TRANSCRIPTION_MODEL_COSTS;

export type TranscriptionResponse = {
  duration: number;
};

export const calculateOpenAITranscriptionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITranscriptionModelType;
  response: TranscriptionResponse;
}): number | null => {
  if (model !== "whisper-1") {
    return null;
  }

  const durationInSeconds = response.duration;

  return Math.ceil(durationInSeconds) * TRANSCRIPTION_MODEL_COSTS[model];
};
