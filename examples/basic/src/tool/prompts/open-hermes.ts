import {
  TextInstructionPrompt,
  ToolCallsOrGenerateTextPromptTemplate,
  ToolDefinition,
  zodSchema,
  parseJSON,
} from "modelfusion";
import { nanoid } from "nanoid";
import { z } from "zod";

export const openHermesToolCallsPromptTemplate: ToolCallsOrGenerateTextPromptTemplate<
  string,
  TextInstructionPrompt
> = {
  createPrompt(prompt: string, tools: Array<ToolDefinition<string, unknown>>) {
    // prompt inspired by https://github.com/abacaj/openhermes-function-calling/
    return {
      system: [
        "You are a helpful assistant with access to the following functions:",
        "",
        ...tools.map((tool) =>
          JSON.stringify({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters.getJsonSchema(),
          })
        ),
        "",
        "To use these functions respond with a JSON object inside <functioncall> XML tags:",
        '<functioncall> { "name": functionName, "args": functionArgs } </functioncall>',
        "",
        "Edge cases you must handle:",
        "- If there are no functions that match the user request, you will respond politely that you cannot help.",
      ].join("\n"),
      instruction: prompt,
    };
  },

  extractToolCallsAndText(response: string) {
    const functionCallStart = response.indexOf("<functioncall>");
    const functionCallEnd = response.indexOf("</functioncall>");

    if (
      functionCallStart === -1 ||
      functionCallEnd === -1 ||
      functionCallEnd < functionCallStart
    ) {
      return {
        text: response,
        toolCalls: [],
      };
    }

    // extract function call:
    const functionCall = response.slice(
      functionCallStart + "<functioncall>".length,
      functionCallEnd
    );

    // parse function call:
    const functionCallJson = parseJSON({
      text: functionCall,
      schema: zodSchema(z.object({ name: z.string(), args: z.any() })),
    });

    // extract text before and after function call, concatenate and trim:
    const text = response
      .slice(0, functionCallStart)
      .concat(response.slice(functionCallEnd + "</functioncall>".length))
      .trim();

    return {
      text: text.length > 0 ? text : null,
      toolCalls: [
        {
          id: nanoid(),
          name: functionCallJson.name,
          args: functionCallJson.args,
        },
      ],
    };
  },
};
