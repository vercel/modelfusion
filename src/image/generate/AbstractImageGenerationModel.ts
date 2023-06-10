import { createId } from "@paralleldrive/cuid2";
import { ModelInformation } from "../../run/ModelInformation.js";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import {
  BaseImageGenerationModelSettings,
  ImageGenerationModel,
} from "./ImageGenerationModel.js";
import {
  ImageGenerationFinishedEvent,
  ImageGenerationStartedEvent,
} from "./ImageGenerationObserver.js";

export abstract class AbstractImageGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends BaseImageGenerationModelSettings
> implements ImageGenerationModel<PROMPT, SETTINGS>
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
      settings: SETTINGS & {
        functionId?: string;
      },
      run?: RunContext
    ) => PromiseLike<RESPONSE>;
  }) {
    this.settings = settings;
    this.extractBase64Image = extractBase64Image;
    this.generateResponse = generateResponse;
  }

  abstract readonly provider: string;
  abstract readonly model: string | null;

  get modelInformation(): ModelInformation {
    return {
      provider: this.provider,
      name: this.model,
    };
  }

  readonly settings: SETTINGS;

  private extractBase64Image: (response: RESPONSE) => string;
  private generateResponse: (
    prompt: PROMPT,
    settings: SETTINGS & {
      functionId?: string;
    },
    run?: RunContext
  ) => PromiseLike<RESPONSE>;

  protected get uncaughtErrorHandler() {
    return (
      this.settings.uncaughtErrorHandler ??
      ((error) => {
        console.error(error);
      })
    );
  }

  async generateImage(
    prompt: PROMPT,
    settings?:
      | (Partial<SETTINGS> & {
          functionId?: string;
        })
      | null,
    run?: RunContext
  ): Promise<string> {
    if (settings != null) {
      const settingKeys = Object.keys(settings);

      // create new instance when there are settings other than 'functionId':
      if (
        settingKeys.length > 1 ||
        (settingKeys.length === 1 && settingKeys[0] !== "functionId")
      ) {
        return this.withSettings(settings).generateImage(
          prompt,
          {
            functionId: settings.functionId,
          } as Partial<SETTINGS> & { functionId?: string },
          run
        );
      }
    }

    const startTime = performance.now();
    const startEpochSeconds = Math.floor(
      (performance.timeOrigin + startTime) / 1000
    );

    const callId = createId();

    const startMetadata = {
      runId: run?.runId,
      sessionId: run?.sessionId,
      userId: run?.userId,

      functionId: settings?.functionId,
      callId,

      model: this.modelInformation,

      startEpochSeconds,
    };

    const startEvent: ImageGenerationStartedEvent = {
      type: "image-generation-started",
      metadata: startMetadata,
      prompt,
    };

    const observers = [
      ...(this.settings.observers ?? []),
      ...(run?.observers ?? []),
    ];

    observers.forEach((observer) => {
      try {
        observer?.onImageGenerationStarted?.(startEvent);
      } catch (error) {
        this.uncaughtErrorHandler(error);
      }
    });

    const result = await runSafe(() =>
      this.generateResponse(
        prompt,
        Object.assign({}, this.settings, settings), // include function id
        run
      )
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

        observers.forEach((observer) => {
          try {
            observer?.onImageGenerationFinished?.(endEvent);
          } catch (error) {
            this.uncaughtErrorHandler(error);
          }
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

      observers.forEach((observer) => {
        try {
          observer?.onImageGenerationFinished?.(endEvent);
        } catch (error) {
          this.uncaughtErrorHandler(error);
        }
      });

      // TODO instead throw a generate text error with a cause?
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

    observers.forEach((observer) => {
      try {
        observer?.onImageGenerationFinished?.(endEvent);
      } catch (error) {
        this.uncaughtErrorHandler(error);
      }
    });

    return extractedImage;
  }

  generateImageAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    settings?: Partial<SETTINGS> & {
      functionId?: string;
    }
  ) {
    return async (input: INPUT, run?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateImage(
        expandedPrompt,
        Object.assign({}, settings, run)
      );
    };
  }

  abstract withSettings(additionalSettings: Partial<SETTINGS>): this;
}
