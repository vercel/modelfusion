import { executeCall } from "../executeCall.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  TextGenerationModel,
  TextGenerationModelSettings,
} from "./TextGenerationModel.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "./TextGenerationObserver.js";

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

  private get shouldTrimOutput() {
    return this.settings.trimOutput ?? true;
  }

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
        const startEvent: TextGenerationStartedEvent = {
          type: "text-generation-started",
          metadata: startMetadata,
          prompt,
        };

        observer?.onTextGenerationStarted?.(startEvent);
      },
      notifyObserverAboutAbort(observer, metadata) {
        const endEvent: TextGenerationFinishedEvent = {
          type: "text-generation-finished",
          status: "abort",
          metadata,
          prompt,
        };

        observer?.onTextGenerationFinished?.(endEvent);
      },
      notifyObserverAboutError(observer, error, metadata) {
        const endEvent: TextGenerationFinishedEvent = {
          type: "text-generation-finished",
          status: "failure",
          metadata,
          prompt,
          error,
        };

        observer?.onTextGenerationFinished?.(endEvent);
      },
      notifyObserverAboutFinish(observer, output, metadata) {
        const endEvent: TextGenerationFinishedEvent = {
          type: "text-generation-finished",
          status: "success",
          metadata,
          prompt,
          generatedText: output,
        };

        observer?.onTextGenerationFinished?.(endEvent);
      },
      errorHandler: this.uncaughtErrorHandler,
      generateResponse: (options) => this.generateResponse(prompt, options),
      extractOutputValue(model, result) {
        return model.shouldTrimOutput
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
