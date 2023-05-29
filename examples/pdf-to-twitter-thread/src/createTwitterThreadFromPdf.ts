import { extractTopicAndExcludeChatPrompt } from "ai-utils.js/prompt";
import { createOpenAIChatModel } from "ai-utils.js/model/openai";
import { RunContext } from "ai-utils.js/run";
import {
  generateText,
  splitMapFilterReduce,
  splitRecursivelyAtTokenForModel,
} from "ai-utils.js/text";
import { loadPdfAsText } from "./loadPdfAsText";

export async function createTwitterThreadFromPdf({
  topic,
  pdfPath,
  openAiApiKey,
  context,
}: {
  topic: string;
  pdfPath: string;
  openAiApiKey: string;
  context: RunContext;
}) {
  const gpt4 = createOpenAIChatModel({
    apiKey: openAiApiKey,
    model: "gpt-4",
  });

  const reservedCompletionTokens = 1024;
  const extractTopicPrompt = extractTopicAndExcludeChatPrompt({
    excludeKeyword: "IRRELEVANT",
    topic,
  });

  return splitMapFilterReduce(
    {
      split: splitRecursivelyAtTokenForModel.asSplitFunction({
        model: gpt4,
        maxChunkSize:
          gpt4.maxTokens -
          reservedCompletionTokens -
          (await gpt4.countPromptTokens(
            await extractTopicPrompt({ text: "" })
          )),
      }),
      map: generateText.asFunction({
        functionId: "extract-topic",
        model: gpt4.withSettings({
          temperature: 0,
          maxCompletionTokens: reservedCompletionTokens,
        }),
        prompt: extractTopicPrompt,
      }),
      filter: (text) => text !== "IRRELEVANT",
      reduce: generateText.asFunction({
        functionId: "write-twitter-thread",
        model: gpt4.withSettings({
          temperature: 0.5,
        }),
        prompt: async ({ text }) => [
          {
            role: "user" as const,
            content: `## TOPIC\n${topic}`,
          },
          {
            role: "system" as const,
            content: `## TASK
Rewrite the content below into a coherent twitter thread on the topic above.
Include all relevant information about the topic.
Discard all irrelevant information.
Separate each tweet with ---`,
          },
          {
            role: "user" as const,
            content: `## CONTENT\n${text}`,
          },
        ],
      }),
      text: await loadPdfAsText(pdfPath),
    },
    context
  );
}
