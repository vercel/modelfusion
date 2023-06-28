import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import { executeCall } from "../executeCall.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";

export abstract class AbstractTextGenerationModel<
    PROMPT,
    RESPONSE,
    SETTINGS extends TextGenerationModelSettings
  >
  extends AbstractModel<SETTINGS>
  implements TextGenerationModel<PROMPT, SETTINGS>
{
  constructor({
    settings,
    extractText,
    generateResponse,
  }: {
    settings: SETTINGS;
    extractText: (response: RESPONSE) => string;
    generateResponse: (
      prompt: PROMPT,
      options?: FunctionOptions<SETTINGS>
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });
    this.extractText = extractText;
    this.generateResponse = generateResponse;
  }

  private extractText: (response: RESPONSE) => string;
  private generateResponse: (
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  async generateText(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): Promise<string> {
    return executeCall({
      model: this,
      options,
      callModel: (model, options) => {
        return model.generateText(prompt, options);
      },
      notifyObserverAboutStart: (observer, startMetadata) => {
        observer?.onTextGenerationStarted?.({
          type: "text-generation-started",
          metadata: startMetadata,
          prompt,
        });
      },
      notifyObserverAboutAbort(observer, metadata) {
        observer?.onTextGenerationFinished?.({
          type: "text-generation-finished",
          status: "abort",
          metadata,
          prompt,
        });
      },
      notifyObserverAboutError(observer, error, metadata) {
        observer?.onTextGenerationFinished?.({
          type: "text-generation-finished",
          status: "failure",
          metadata,
          prompt,
          error,
        });
      },
      notifyObserverAboutFinish(observer, output, metadata) {
        observer?.onTextGenerationFinished?.({
          type: "text-generation-finished",
          status: "success",
          metadata,
          prompt,
          generatedText: output,
        });
      },
      errorHandler: this.uncaughtErrorHandler,
      generateResponse: (options) => this.generateResponse(prompt, options),
      extractOutputValue(model, result) {
        const shouldTrimOutput = model.settings.trimOutput ?? true;
        return shouldTrimOutput
          ? model.extractText(result).trim()
          : model.extractText(result);
      },
    });
  }

  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
  ) {
    return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(expandedPrompt, {
        functionId: options?.functionId ?? generateOptions?.functionId,
        settings: Object.assign(
          {},
          generateOptions?.settings,
          options?.settings
        ),
        run: options?.run,
      });
    };
  }
}
