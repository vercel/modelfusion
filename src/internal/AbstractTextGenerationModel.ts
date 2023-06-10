import { createId } from "@paralleldrive/cuid2";
import { ModelInformation } from "../run/ModelInformation.js";
import { PromptTemplate } from "../run/PromptTemplate.js";
import { RunContext } from "../run/RunContext.js";
import {
  BaseTextGenerationModelSettings,
  TextGenerationModel,
} from "../text/generate/TextGenerationModel.js";
import {
  TextGenerationFinishedEvent,
  TextGenerationStartedEvent,
} from "../text/generate/TextGenerationObserver.js";
import { AbortError } from "../util/AbortError.js";
import { runSafe } from "../util/runSafe.js";

export abstract class AbstractTextGenerationModel<
  PROMPT,
  RESPONSE,
  SETTINGS extends BaseTextGenerationModelSettings
> implements TextGenerationModel<PROMPT, SETTINGS>
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
      run?: RunContext
    ) => PromiseLike<RESPONSE>;
  }) {
    this.settings = settings;
    this.extractText = extractText;
    this.generateResponse = generateResponse;
  }

  abstract readonly provider: string;
  abstract readonly model: string;

  get modelInformation(): ModelInformation {
    return {
      provider: this.provider,
      name: this.model,
    };
  }

  readonly settings: SETTINGS;

  private extractText: (response: RESPONSE) => string;
  private generateResponse: (
    prompt: PROMPT,
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

  private get shouldTrimOutput() {
    return this.settings.trimOutput ?? true;
  }

  async generateText(
    prompt: PROMPT,
    options?: Partial<SETTINGS> | null,
    run?: RunContext
  ): Promise<string> {
    if (options != null) {
      return this.withSettings(options).generateText(prompt, undefined, run);
    }

    const startTime = performance.now();
    const startEpochSeconds = Math.floor(
      (performance.timeOrigin + startTime) / 1000
    );

    const callId = createId();

    const startMetadata = {
      generateTextCallId: callId,
      runId: run?.runId,
      sessionId: run?.sessionId,
      userId: run?.userId,

      model: this.modelInformation,

      startEpochSeconds,
    };

    const startEvent: TextGenerationStartedEvent = {
      type: "text-generation-started",
      metadata: startMetadata,
      prompt,
    };

    const observers = [
      ...(this.settings.observers ?? []),
      ...(run?.observers ?? []),
    ];

    observers.forEach((observer) => {
      try {
        observer?.onTextGenerationStarted?.(startEvent);
      } catch (error) {
        this.uncaughtErrorHandler(error);
      }
    });

    const result = await runSafe(() => this.generateResponse(prompt, run));

    const generationDurationInMs = Math.ceil(performance.now() - startTime);

    const metadata = {
      durationInMs: generationDurationInMs,
      ...startMetadata,
    };

    if (!result.ok) {
      if (result.isAborted) {
        const endEvent: TextGenerationFinishedEvent = {
          type: "text-generation-finished",
          status: "abort",
          metadata,
          prompt,
        };

        observers.forEach((observer) => {
          try {
            observer?.onTextGenerationFinished?.(endEvent);
          } catch (error) {
            this.uncaughtErrorHandler(error);
          }
        });

        throw new AbortError();
      }

      const endEvent: TextGenerationFinishedEvent = {
        type: "text-generation-finished",
        status: "failure",
        metadata,
        prompt,
        error: result.error,
      };

      observers.forEach((observer) => {
        try {
          observer?.onTextGenerationFinished?.(endEvent);
        } catch (error) {
          this.uncaughtErrorHandler(error);
        }
      });

      // TODO instead throw a generate text error with a cause?
      throw result.error;
    }

    const extractedText = this.shouldTrimOutput
      ? this.extractText(result.output).trim()
      : this.extractText(result.output);

    const endEvent: TextGenerationFinishedEvent = {
      type: "text-generation-finished",
      status: "success",
      metadata,
      prompt,
      generatedText: extractedText,
    };

    observers.forEach((observer) => {
      try {
        observer?.onTextGenerationFinished?.(endEvent);
      } catch (error) {
        this.uncaughtErrorHandler(error);
      }
    });

    return extractedText;
  }

  generateTextAsFunction<INPUT>(
    promptTemplate: PromptTemplate<INPUT, PROMPT>,
    options?: Partial<SETTINGS>
  ) {
    return async (input: INPUT, context?: RunContext) => {
      const expandedPrompt = await promptTemplate(input);
      return this.generateText(
        expandedPrompt,
        Object.assign({}, options, context)
      );
    };
  }

  abstract withSettings(additionalSettings: Partial<SETTINGS>): this;
}
