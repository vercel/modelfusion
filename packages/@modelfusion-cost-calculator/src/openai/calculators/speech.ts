import {
  OpenAISpeechModelType,
  OPENAI_SPEECH_MODELS,
} from "@modelfusion/types";

export const calculateOpenAISpeechCostInMillicents = ({
  model,
  input,
}: {
  model: OpenAISpeechModelType;
  input: string;
}): number | null => {
  if (!OPENAI_SPEECH_MODELS[model]) {
    return null;
  }

  return (
    input.length * OPENAI_SPEECH_MODELS[model].costInMillicentsPerCharacter
  );
};
