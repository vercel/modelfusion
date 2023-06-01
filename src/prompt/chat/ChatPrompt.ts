import { OpenAIChatMessage } from "../../provider/openai/chat/OpenAIChatResponse.js";
import { Prompt } from "../Prompt.js";

export type ChatPrompt<INPUT> = Prompt<INPUT, Array<OpenAIChatMessage>>;
