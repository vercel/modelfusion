/**
 * @see https://openai.com/pricing
 */
export const OPENAI_SPEECH_MODELS = {
  "tts-1": {
    costInMillicentsPerCharacter: 1.5, // = 1500 / 1000,
  },
  "tts-1-hd": {
    costInMillicentsPerCharacter: 3, // = 3000 / 1000
  },
};

export type OpenAISpeechModelType = keyof typeof OPENAI_SPEECH_MODELS;
