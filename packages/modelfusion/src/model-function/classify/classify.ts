import { FunctionOptions } from "../../core/FunctionOptions.js";
import { ModelCallMetadata } from "../ModelCallMetadata.js";
import { executeStandardCall } from "../executeStandardCall.js";
import { Classifier, ClassifierSettings } from "./Classifier.js";

export async function classify<VALUE, CLASS extends string | null>(
  args: {
    model: Classifier<VALUE, CLASS, ClassifierSettings>;
    value: VALUE;
    fullResponse?: false;
  } & FunctionOptions
): Promise<CLASS>;
export async function classify<VALUE, CLASS extends string | null>(
  args: {
    model: Classifier<VALUE, CLASS, ClassifierSettings>;
    value: VALUE;
    fullResponse: true;
  } & FunctionOptions
): Promise<{
  class: CLASS;
  rawResponse: unknown;
  metadata: ModelCallMetadata;
}>;
export async function classify<VALUE, CLASS extends string | null>({
  model,
  value,
  fullResponse,
  ...options
}: {
  model: Classifier<VALUE, CLASS, ClassifierSettings>;
  value: VALUE;
  fullResponse?: boolean;
} & FunctionOptions): Promise<
  CLASS | { class: CLASS; rawResponse: unknown; metadata: ModelCallMetadata }
> {
  const callResponse = await executeStandardCall({
    functionType: "classify",
    input: value,
    model,
    options,
    generateResponse: async (options) => {
      const result = await model.doClassify(value, options);
      return {
        rawResponse: result.rawResponse,
        extractedValue: result.class,
      };
    },
  });

  return fullResponse
    ? {
        class: callResponse.value,
        rawResponse: callResponse.rawResponse,
        metadata: callResponse.metadata,
      }
    : callResponse.value;
}
