import { DataContent } from "../../../util/format/DataContent";
import { InvalidPromptError } from "./InvalidPromptError";

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
   * Image data. Can either be a base64-encoded string, a Uint8Array, an ArrayBuffer, or a Buffer.
   */
  image: DataContent;

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
