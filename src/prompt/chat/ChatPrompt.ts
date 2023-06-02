import { OpenAIChatMessage } from "../../provider/openai/chat/OpenAIChatMessage.js";
import { Prompt } from "../Prompt.js";

export type ChatPrompt<INPUT> = Prompt<INPUT, Array<OpenAIChatMessage>>;
