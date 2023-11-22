import {
  OpenAICompletionModel,
  OpenAICompletionModelSettings,
} from "./OpenAICompletionModel.js";
import {
  OpenAISpeechModel,
  OpenAISpeechModelSettings,
} from "./OpenAISpeechModel.js";
import {
  OpenAITranscriptionModel,
  OpenAITranscriptionModelSettings,
} from "./OpenAITranscriptionModel.js";
import { OpenAIChatModel, OpenAIChatSettings } from "./chat/OpenAIChatModel.js";

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const model = openai.CompletionTextGenerator({
 *   model: "gpt-3.5-turbo-instruct",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 *   retry: retryWithExponentialBackoff({ maxTries: 5 }),
 * });
 *
 * const text = await generateText(
 *   model,
 *   "Write a short story about a robot learning to love:\n\n"
 * );
 *
 * @return A new instance of {@link OpenAICompletionModel}.
 */
export function CompletionTextGenerator(
  settings: OpenAICompletionModelSettings
) {
  return new OpenAICompletionModel(settings);
}

/**
 * Create a text generation model that calls the OpenAI chat completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/chat/create
 *
 * @example
 * const model = openai.ChatTextGenerator({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0.7,
 *   maxCompletionTokens: 500,
 * });
 *
 * const text = await generateText([
 *   model,
 *   OpenAIChatMessage.system(
 *     "Write a short story about a robot learning to love:"
 *   ),
 * ]);
 */
export function ChatTextGenerator(settings: OpenAIChatSettings) {
  return new OpenAIChatModel(settings);
}

/**
 * Synthesize speech using the OpenAI API.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/createSpeech
 *
 * @returns A new instance of {@link OpenAISpeechModel}.
 */
export function Speech(settings: OpenAISpeechModelSettings) {
  return new OpenAISpeechModel(settings);
}

/**
 * Create a transcription model that calls the OpenAI transcription API.
 *
 * @see https://platform.openai.com/docs/api-reference/audio/create
 *
 * @example
 * const data = await fs.promises.readFile("data/test.mp3");
 *
 * const transcription = await transcribe(
 *   openai.Transcription({ model: "whisper-1" }),
 *   {
 *     type: "mp3",
 *     data,
 *   }
 * );
 *
 * @returns A new instance of {@link OpenAITranscriptionModel}.
 */
export function Transcription(settings: OpenAITranscriptionModelSettings) {
  return new OpenAITranscriptionModel(settings);
}
