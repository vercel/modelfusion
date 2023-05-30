import { OpenAIChatMessage } from "../../provider/openai/chat/OpenAIChatCompletion.js";
import { Prompt } from "../Prompt.js";

export type ChatPrompt<INPUT> = Prompt<INPUT, Array<OpenAIChatMessage>>;
