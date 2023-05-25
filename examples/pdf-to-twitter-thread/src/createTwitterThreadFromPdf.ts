import { RunContext } from "@lgrammel/ai-utils/run";
import { openAIChatModel } from "@lgrammel/ai-utils/provider/openai";
import { splitMapFilterReduce } from "@lgrammel/ai-utils/text/map";
import { splitRecursivelyAtCharacter } from "@lgrammel/ai-utils/text/split";
import { generateText } from "@lgrammel/ai-utils/text/generate";
import { extractTopicAndExcludeChatPrompt } from "@lgrammel/ai-utils/prompt";
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
  const model = openAIChatModel({
    apiKey: openAiApiKey,
    model: "gpt-4",
  });

  return splitMapFilterReduce(
    {
      split: splitRecursivelyAtCharacter.asSplitFunction({
        maxChunkSize: 1024 * 4,
      }),
      map: generateText.asFunction({
        id: "extract-topic",
        model,
        prompt: extractTopicAndExcludeChatPrompt({
          excludeKeyword: "IRRELEVANT",
          topic,
        }),
      }),
      filter: (text) => text !== "IRRELEVANT",
      reduce: generateText.asFunction({
        id: "write-twitter-thread",
        model,
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
