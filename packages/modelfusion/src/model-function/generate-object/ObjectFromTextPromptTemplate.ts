import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer";
import { Schema } from "../../core/schema/Schema";
import { TextStreamingModel } from "../generate-text/TextGenerationModel";
import { ChatPrompt } from "../generate-text/prompt-template/ChatPrompt";
import { InstructionPrompt } from "../generate-text/prompt-template/InstructionPrompt";

export type ObjectFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> = {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => TARGET_PROMPT;

  extractObject: (response: string) => unknown;

  withJsonOutput?({
    model,
    schema,
  }: {
    model: {
      withJsonOutput(
        schema: Schema<unknown> & JsonSchemaProducer
      ): typeof model;
    };
    schema: Schema<unknown> & JsonSchemaProducer;
  }): typeof model;
};

export type FlexibleObjectFromTextPromptTemplate<
  SOURCE_PROMPT,
  INTERMEDIATE_PROMPT,
> = {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => INTERMEDIATE_PROMPT;
  extractObject: (response: string) => unknown;

  adaptModel: (
    model: TextStreamingModel<never> & {
      withTextPrompt(): TextStreamingModel<string>;
      withInstructionPrompt(): TextStreamingModel<InstructionPrompt>;
      withChatPrompt(): TextStreamingModel<ChatPrompt>;
    }
  ) => TextStreamingModel<INTERMEDIATE_PROMPT>;

  withJsonOutput?({
    model,
    schema,
  }: {
    model: {
      withJsonOutput(
        schema: Schema<unknown> & JsonSchemaProducer
      ): typeof model;
    };
    schema: Schema<unknown> & JsonSchemaProducer;
  }): typeof model;
};
