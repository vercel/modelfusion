import {
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
} from "ai-utils.js/provider/openai";
import { RunContext } from "ai-utils.js/run";
import {
  EmbedTextObserver,
  GenerateTextObserver,
  embedText,
  generateText,
  mapRecursively,
  splitRecursivelyAtTokenForModel,
} from "ai-utils.js/text";
import { InMemoryVectorDB } from "ai-utils.js/vector-db";
import fs from "node:fs";
import z from "zod";
import { loadPdfAsText } from "./loadPdfAsText";

export async function createTweetFromPdf({
  topic,
  pdfPath,
  exampleTweetIndexPath,
  openAiApiKey,
  context,
}: {
  topic: string;
  pdfPath: string;
  exampleTweetIndexPath: string;
  openAiApiKey: string;
  context: RunContext & GenerateTextObserver & EmbedTextObserver;
}) {
  const embeddingModel = new OpenAITextEmbeddingModel({
    apiKey: openAiApiKey,
    model: "text-embedding-ada-002",
  });

  const textModel = new OpenAIChatModel({
    apiKey: openAiApiKey,
    model: "gpt-4",
  });

  const exampleTweetStore = await InMemoryVectorDB.deserialize({
    serializedData: fs.readFileSync(exampleTweetIndexPath, "utf-8"),
    schema: z.object({ tweet: z.string() }),
  });

  const textFromPdf = await loadPdfAsText(pdfPath);

  // extract information on topic from pdf:
  const reservedCompletionTokens = 1024;
  const extractTopicPrompt = async ({ text }: { text: string }) => [
    {
      role: "user" as const,
      content: `## TOPIC\n${topic}`,
    },
    {
      role: "system" as const,
      content: `## ROLE
You are an expert at extracting information.
You need to extract and keep all the information on the topic above topic from the text below.
Only include information that is directly relevant for the topic.`,
    },
    {
      role: "user" as const,
      content: `## TEXT\n${text}`,
    },
  ];

  const informationOnTopic = await mapRecursively(
    {
      split: splitRecursivelyAtTokenForModel.asSplitFunction({
        model: textModel,
        maxChunkSize:
          textModel.maxTokens -
          reservedCompletionTokens -
          (await textModel.countPromptTokens(
            await extractTopicPrompt({ text: "" })
          )),
      }),
      map: generateText.asFunction({
        functionId: "extract-information-on-topic",
        model: textModel.withSettings({
          temperature: 0,
          maxTokens: reservedCompletionTokens,
        }),
        prompt: extractTopicPrompt,
      }),
      text: textFromPdf,
    },
    context
  );

  // generate a draft tweet:
  const draftTweet = await generateText(
    {
      functionId: "generate-draft-tweet",
      model: textModel.withSettings({ temperature: 0.5 }),
      input: { content: informationOnTopic, topic },
      prompt: async ({ content, topic }) => [
        {
          role: "user" as const,
          content: `## TOPIC\n${topic}`,
        },
        {
          role: "system" as const,
          content: `## TASK
Rewrite the content below into coherent tweet on the topic above.
Include all relevant information about the topic.
Discard all irrelevant information.`,
        },
        {
          role: "user" as const,
          content: `## CONTENT\n${content}`,
        },
      ],
    },
    context
  );

  // get embedding of draft tweet:
  const draftTweetEmbedding = await embedText(
    {
      functionId: "embed-draft-tweet",
      text: draftTweet,
      model: embeddingModel,
    },
    context
  );

  // search for similar tweets:
  const similarTweets = await exampleTweetStore.search({
    queryVector: draftTweetEmbedding,
    maxResults: 1,
    similarityThreshold: 0.5,
  });

  if (similarTweets.length === 0) {
    return draftTweet;
  }

  // rewrite the tweet:
  return await generateText(
    {
      functionId: "rewrite-tweet",
      model: textModel.withSettings({ temperature: 0.5 }),
      input: { draftTweet, topic, exampleTweet: similarTweets[0].data.tweet },
      prompt: async ({ draftTweet, topic, exampleTweet }) => [
        {
          role: "system" as const,
          content: `## TASK
Rewrite the draft tweet on ${topic} using the style from the example tweet.`,
        },
        {
          role: "user" as const,
          content: `## DRAFT TWEET\n${draftTweet}`,
        },
        {
          role: "user" as const,
          content: `## STYLE EXAMPLE\n${exampleTweet}`,
        },
      ],
    },
    context
  );
}
