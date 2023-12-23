import { InvalidPromptError } from "./InvalidPromptError.js";

/**
 * Content can either be a simple text content (`string`) or a
 * complex multimodal content that is a mix of text parts and
 * image parts.
 */
export type Content = string | Array<TextPart | ImagePart>;

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

export function validateContentIsString(
  content: Content,
  prompt: unknown
): string {
  if (typeof content !== "string") {
    throw new InvalidPromptError(
      "only text prompts are are supported by this prompt template",
      prompt
    );
  }

  return content;
}
