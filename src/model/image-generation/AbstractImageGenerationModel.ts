import { createId } from "@paralleldrive/cuid2";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { RunContext } from "../../run/RunContext.js";
import { AbortError } from "../../util/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { AbstractModel } from "../AbstractModel.js";
import {
  ImageGenerationModelSettings,
  ImageGenerationModel,
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
      settings: SETTINGS & {
        functionId?: string;
      },
      run?: RunContext
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });
    this.extractBase64Image = extractBase64Image;
    this.generateResponse = generateResponse;
  }

  private extractBase64Image: (response: RESPONSE) => string;
  private generateResponse: (
    prompt: PROMPT,
    settings: SETTINGS & {
      functionId?: string;
    },
    run?: RunContext
  ) => PromiseLike<RESPONSE>;

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

    this.callEachObserver(run, (observer) => {
      observer?.onImageGenerationStarted?.(startEvent);
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

    this.callEachObserver(run, (observer) => {
      observer?.onImageGenerationFinished?.(endEvent);
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
}
