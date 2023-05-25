import { OpenAIChatMessage } from "../../provider/openai/api/OpenAIChatCompletion.js";
import { Prompt } from "../Prompt.js";

export type ChatPrompt<INPUT> = Prompt<INPUT, Array<OpenAIChatMessage>>;
