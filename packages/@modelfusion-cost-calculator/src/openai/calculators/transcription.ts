import {
  OpenAITranscriptionModelType,
  OpenAITranscriptionVerboseJsonResponse,
  OPENAI_TRANSCRIPTION_MODELS,
} from "@modelfusion/types";

export const calculateOpenAITranscriptionCostInMillicents = ({
  model,
  response,
}: {
  model: OpenAITranscriptionModelType;
  response: OpenAITranscriptionVerboseJsonResponse;
}): number | null => {
  if (model !== "whisper-1") {
    return null;
  }

  const durationInSeconds = response.duration;

  return (
    Math.ceil(durationInSeconds) *
    OPENAI_TRANSCRIPTION_MODELS[model].costInMillicentsPerSecond
  );
};
