import { nanoid as createId } from "nanoid";
import { PromptTemplate } from "../../run/PromptTemplate.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
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
    if (options?.settings != null) {
      return this.withSettings(options.settings).generateText(prompt, {
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

    const startEvent: TextGenerationStartedEvent = {
      type: "text-generation-started",
      metadata: startMetadata,
      prompt,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onTextGenerationStarted?.(startEvent);
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
        const endEvent: TextGenerationFinishedEvent = {
          type: "text-generation-finished",
          status: "abort",
          metadata,
          prompt,
        };

        this.callEachObserver(run, (observer) => {
          observer?.onTextGenerationFinished?.(endEvent);
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

      this.callEachObserver(run, (observer) => {
        observer?.onTextGenerationFinished?.(endEvent);
      });

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

    this.callEachObserver(run, (observer) => {
      observer?.onTextGenerationFinished?.(endEvent);
    });

    return extractedText;
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
