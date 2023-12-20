import { TextGenerationModelSettings } from "../../model-function/generate-text/TextGenerationModel.js";

export interface OllamaTextGenerationSettings
  extends TextGenerationModelSettings {
  /**
   * The name of the model to use. For example, 'mistral'.
   *
   * @see https://ollama.ai/library
   */
  model: string;

  /**
   * The temperature of the model. Increasing the temperature will make the model
   * answer more creatively. (Default: 0.8)
   */
  temperature?: number;

  /**
   * Enable Mirostat sampling for controlling perplexity.
   * (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
   */
  mirostat?: number;

  /**
   * Influences how quickly the algorithm responds to feedback from the generated text.
   * A lower learning rate will result in slower adjustments,
   * while a higher learning rate will make the algorithm more responsive. (Default: 0.1)
   */
  mirostatEta?: number;

  /**
   * Controls the balance between coherence and diversity of the output.
   * A lower value will result in more focused and coherent text. (Default: 5.0)
   */
  mirostatTau?: number;

  /**
   * The number of GQA groups in the transformer layer. Required for some models,
   * for example it is 8 for llama2:70b
   */
  numGqa?: number;

  /**
   * The number of layers to send to the GPU(s). On macOS it defaults to 1 to
   * enable metal support, 0 to disable.
   */
  numGpu?: number;

  /**
   * Sets the number of threads to use during computation. By default, Ollama will
   * detect this for optimal performance. It is recommended to set this value to the
   * number of physical CPU cores your system has (as opposed to the logical number of cores).
   */
  numThreads?: number;

  /**
   * Sets how far back for the model to look back to prevent repetition.
   * (Default: 64, 0 = disabled, -1 = num_ctx)
   */
  repeatLastN?: number;

  /**
   * Sets how strongly to penalize repetitions. A higher value (e.g., 1.5)
   * will penalize repetitions more strongly, while a lower value (e.g., 0.9)
   * will be more lenient. (Default: 1.1)
   */
  repeatPenalty?: number;

  /**
   * Sets the random number seed to use for generation. Setting this to a
   * specific number will make the model generate the same text for the same prompt.
   * (Default: 0)
   */
  seed?: number;

  /**
   * Tail free sampling is used to reduce the impact of less probable tokens
   * from the output. A higher value (e.g., 2.0) will reduce the impact more,
   * while a value of 1.0 disables this setting. (default: 1)
   */
  tfsZ?: number;

  /**
   * Reduces the probability of generating nonsense. A higher value (e.g. 100)
   * will give more diverse answers, while a lower value (e.g. 10) will be more
   *  conservative. (Default: 40)
   */
  topK?: number;

  /**
   * Works together with top-k. A higher value (e.g., 0.95) will lead to more
   * diverse text, while a lower value (e.g., 0.5) will generate more focused
   * and conservative text. (Default: 0.9)
   */
  topP?: number;

  /**
   * The format to return a response in. Currently the only accepted value is 'json'.
   * Leave undefined to return a string.
   */
  format?: "json";

  template?: string;
}
