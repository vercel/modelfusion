import { InvalidPromptError } from "./InvalidPromptError.js";

export interface TextPart {
  type: "text";

  /**
   * The text content.
   */
  text: string;
}

export interface ImagePart {
  type: "image";

  /**
   * Base-64 encoded image.
   */
  base64Image: string;

  /**
   * Optional mime type of the image.
   */
  mimeType?: string;
}

export interface ToolCallPart {
  type: "tool-call";

  id: string;
  name: string;
  args: unknown;
}

export interface ToolResponsePart {
  type: "tool-response";

  id: string;
  response: unknown;
}

export function validateContentIsString(
  content: string | unknown,
  prompt: unknown
): string {
  if (typeof content !== "string") {
    throw new InvalidPromptError(
      "Only text prompts are are supported by this prompt template.",
      prompt
    );
  }

  return content;
}
