type BaseModelCallFinishedEventResult =
  | {
      status: "success";

      /**
       * The original model response.
       */
      rawResponse: unknown;

      value: unknown;

      /**
       * Optional usage information for the model call. The type depends on the call type.
       */
      usage?: unknown;
    }
  | { status: "error"; error: unknown }
  | { status: "abort" };

interface BaseModelCallFinishedEvent {
  functionType: string;
  model: {
    provider: string;
    modelName: string | null;
  };

  /**
   * The main input to the model call. The type depends on the call type or model.
   */
  input: unknown;

  /**
   * The model settings used for the call. The type depends on the model.
   */
  settings: unknown;

  /**
   * The result of the model call. Can be "success", "error", or "abort". Additional information is provided depending on the status.
   */
  result: BaseModelCallFinishedEventResult;
}

export interface SuccessfulModelCall extends BaseModelCallFinishedEvent {
  result: BaseModelCallFinishedEventResult & {
    status: "success";
  };
}
