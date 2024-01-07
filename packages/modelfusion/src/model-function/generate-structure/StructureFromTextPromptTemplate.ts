import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";
import { TextStreamingModel } from "../generate-text/TextGenerationModel.js";
import { ChatPrompt } from "../generate-text/prompt-template/ChatPrompt.js";
import { InstructionPrompt } from "../generate-text/prompt-template/InstructionPrompt.js";

export type StructureFromTextPromptTemplate<SOURCE_PROMPT, TARGET_PROMPT> = {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => TARGET_PROMPT;

  extractStructure: (response: string) => unknown;

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

export type FlexibleStructureFromTextPromptTemplate<
  SOURCE_PROMPT,
  INTERMEDIATE_PROMPT,
> = {
  createPrompt: (
    prompt: SOURCE_PROMPT,
    schema: Schema<unknown> & JsonSchemaProducer
  ) => INTERMEDIATE_PROMPT;
  extractStructure: (response: string) => unknown;

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
