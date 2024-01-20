import { uint8ArrayToBase64 } from "../../../util/UInt8Utils.js";
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
   * Image data. Can either be a base64-encoded string or a Uint8Array.
   */
  image: string | Uint8Array;

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

export function getImageAsBase64(image: string | Uint8Array): string {
  if (typeof image === "string") {
    return image;
  }

  return uint8ArrayToBase64(image);
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
