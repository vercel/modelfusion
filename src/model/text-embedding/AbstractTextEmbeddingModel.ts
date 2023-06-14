import { nanoid as createId } from "nanoid";
import { Vector } from "../../run/Vector.js";
import { AbortError } from "../../util/api/AbortError.js";
import { runSafe } from "../../util/runSafe.js";
import { AbstractModel } from "../AbstractModel.js";
import { FunctionOptions } from "../FunctionOptions.js";
import {
  TextEmbeddingModel,
  TextEmbeddingModelSettings,
} from "./TextEmbeddingModel.js";
import {
  TextEmbeddingFinishedEvent,
  TextEmbeddingStartedEvent,
} from "./TextEmbeddingObserver.js";

export abstract class AbstractTextEmbeddingModel<
    RESPONSE,
    SETTINGS extends TextEmbeddingModelSettings
  >
  extends AbstractModel<SETTINGS>
  implements TextEmbeddingModel<SETTINGS>
{
  constructor({
    settings,
    extractEmbeddings,
    generateResponse,
  }: {
    settings: SETTINGS;
    extractEmbeddings: (response: RESPONSE) => Vector[];
    generateResponse: (
      texts: string[],
      options?: FunctionOptions<SETTINGS>
    ) => PromiseLike<RESPONSE>;
  }) {
    super({ settings });

    this.extractEmbeddings = extractEmbeddings;
    this.generateResponse = generateResponse;
  }

  abstract readonly maxTokens: number;
  abstract readonly embeddingDimensions: number;
  protected abstract readonly maxTextsPerCall: number;

  private extractEmbeddings: (response: RESPONSE) => Vector[];
  private generateResponse: (
    texts: string[],
    options?: FunctionOptions<SETTINGS>
  ) => PromiseLike<RESPONSE>;

  async embedTexts(
    texts: string[],
    options?: FunctionOptions<SETTINGS>
  ): Promise<Vector[]> {
    if (options?.settings != null) {
      return this.withSettings(options.settings).embedTexts(texts, {
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

    const startEvent: TextEmbeddingStartedEvent = {
      type: "text-embedding-started",
      metadata: startMetadata,
      texts,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onTextEmbeddingStarted?.(startEvent);
    });

    // split the texts into groups that are small enough to be sent in one call:
    const maxTextsPerCall = this.maxTextsPerCall;
    const textGroups: string[][] = [];
    for (let i = 0; i < texts.length; i += maxTextsPerCall) {
      textGroups.push(texts.slice(i, i + maxTextsPerCall));
    }

    const result = await runSafe(() =>
      Promise.all(
        textGroups.map((textGroup) =>
          this.generateResponse(textGroup, {
            functionId: options?.functionId,
            settings: this.settings, // options.setting is null here
            run,
          })
        )
      )
    );

    const generationDurationInMs = Math.ceil(performance.now() - startTime);

    const metadata = {
      durationInMs: generationDurationInMs,
      ...startMetadata,
    };

    if (!result.ok) {
      if (result.isAborted) {
        const endEvent: TextEmbeddingFinishedEvent = {
          type: "text-embedding-finished",
          status: "abort",
          metadata,
          texts,
        };

        this.callEachObserver(run, (observer) => {
          observer?.onTextEmbeddingFinished?.(endEvent);
        });

        throw new AbortError();
      }

      const endEvent: TextEmbeddingFinishedEvent = {
        type: "text-embedding-finished",
        status: "failure",
        metadata,
        texts,
        error: result.error,
      };

      this.callEachObserver(run, (observer) => {
        observer?.onTextEmbeddingFinished?.(endEvent);
      });

      throw result.error;
    }

    // combine the results:
    const embeddings: Array<Vector> = [];
    for (const response of result.output) {
      embeddings.push(...this.extractEmbeddings(response));
    }

    const endEvent: TextEmbeddingFinishedEvent = {
      type: "text-embedding-finished",
      status: "success",
      metadata,
      texts,
      generatedEmbeddings: embeddings,
    };

    this.callEachObserver(run, (observer) => {
      observer?.onTextEmbeddingFinished?.(endEvent);
    });

    return embeddings;
  }

  async embedText(
    text: string,
    options?: FunctionOptions<SETTINGS>
  ): Promise<Vector> {
    return (await this.embedTexts([text], options))[0];
  }
}
