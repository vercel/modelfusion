// cost per character in millicents
const SpeechModelCosts = {
  "tts-1": 1.5, // = 1500 / 1000,
  "tts-1-hd": 3, // = 3000 / 1000
};

export type OpenAISpeechModelType = keyof typeof SpeechModelCosts;

export const calculateOpenAISpeechCostInMillicents = ({
  model,
  input,
}: {
  model: keyof typeof SpeechModelCosts;
  input: string;
}): number | null => {
  if (!SpeechModelCosts[model]) {
    return null;
  }

  return input.length * SpeechModelCosts[model];
};
