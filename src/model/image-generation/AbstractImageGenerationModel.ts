import { executeCall } from "model/executeCall.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";

export abstract class AbstractImageGenerationModel<
    PROMPT,
    RESPONSE,
    SETTINGS extends ImageGenerationModelSettings
  >
  extends AbstractModel<SETTINGS>
  implements ImageGenerationModel<PROMPT, SETTINGS>
{
  constructor({
    settings,
    extractBase64Image,
    generateResponse,
  }: {
    settings: SETTINGS;
    extractBase64Image: (response: RESPONSE) => string;
    generateResponse: (
      prompt: PROMPT,
      options?: FunctionOptions<SETTINGS>
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });
    this.extractBase64Image = extractBase64Image;
    this.generateResponse = generateResponse;
  }

  private extractBase64Image: (response: RESPONSE) => string;
  private generateResponse: (
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  async generateImage(
    prompt: PROMPT,
    options?: FunctionOptions<SETTINGS>
  ): Promise<string> {
    return executeCall({
      model: this,
      options,
      callModel: (model, options) => model.generateImage(prompt, options),
      notifyObserverAboutStart: (observer, startMetadata) => {
        observer?.onImageGenerationStarted?.({
          type: "image-generation-started",
          metadata: startMetadata,
          prompt,
        });
      },
      notifyObserverAboutAbort(observer, metadata) {
        observer?.onImageGenerationFinished?.({
          type: "image-generation-finished",
          status: "abort",
          metadata,
          prompt,
        });
      },
      notifyObserverAboutFailure(observer, metadata, error) {
        observer?.onImageGenerationFinished?.({
          type: "image-generation-finished",
          status: "failure",
          metadata,
          prompt,
          error,
        });
      },
      notifyObserverAboutSuccess(observer, metadata, output) {
        observer?.onImageGenerationFinished?.({
          type: "image-generation-finished",
          status: "success",
          metadata,
          prompt,
          generatedImage: output,
        });
      },
      errorHandler: this.uncaughtErrorHandler,
      generateResponse: (options) => this.generateResponse(prompt, options),
      extractOutputValue: this.extractBase64Image,
    });
  }

  generateImageAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    generateOptions?: Omit<FunctionOptions<SETTINGS>, "run">
  ) {
    return async (input: INPUT, options?: FunctionOptions<SETTINGS>) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateImage(expandedPrompt, {
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
