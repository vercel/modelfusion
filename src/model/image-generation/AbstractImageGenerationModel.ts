import { nanoid as createId } from "nanoid";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  ImageGenerationModel,
  ImageGenerationModelSettings,
} from "./ImageGenerationModel.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./ImageGenerationObserver.js";

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
    if (options?.settings != null) {
      return this.withSettings(options.settings).generateImage(prompt, {
        functionId: options.functionId,
        run: options.run,
      });
    }

    const run = options?.run;

    const startTime = performance.now();
    const startEpochSeconds = Math.floor(
      (performance.timeOrigin + startTime) / 1000
    );

    const callId = createId();

    const startMetadata = {
      runId: run?.runId,
      sessionId: run?.sessionId,
      userId: run?.userId,

      functionId: options?.functionId,
      callId,

      model: this.modelInformation,

      startEpochSeconds,
    };

    const startEvent: ImageGenerationStartedEvent = {
      type: "image-generation-started",
      metadata: startMetadata,
      prompt,
    };

    this.callEachObserver(run ?? undefined, (observer) => {
      observer?.onImageGenerationStarted?.(startEvent);
    });

    const result = await runSafe(() =>
      this.generateResponse(prompt, {
        functionId: options?.functionId,
        settings: this.settings, // options.setting is null here
        run,
      })
    );

    const generationDurationInMs = Math.ceil(performance.now() - startTime);

    const metadata = {
      durationInMs: generationDurationInMs,
      ...startMetadata,
    };

    if (!result.ok) {
      if (result.isAborted) {
        const endEvent: ImageGenerationFinishedEvent = {
          type: "image-generation-finished",
          status: "abort",
          metadata,
          prompt,
        };

        this.callEachObserver(run, (observer) => {
          observer?.onImageGenerationFinished?.(endEvent);
        });

        throw new AbortError();
      }

      const endEvent: ImageGenerationFinishedEvent = {
        type: "image-generation-finished",
        status: "failure",
        metadata,
        prompt,
        error: result.error,
      };

      this.callEachObserver(run, (observer) => {
        observer?.onImageGenerationFinished?.(endEvent);
      });

      throw result.error;
    }

    const extractedImage = this.extractBase64Image(result.output);

    const endEvent: ImageGenerationFinishedEvent = {
      type: "image-generation-finished",
      status: "success",
      metadata,
      prompt,
      generatedImage: extractedImage,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onImageGenerationFinished?.(endEvent);
    });

    return extractedImage;
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
