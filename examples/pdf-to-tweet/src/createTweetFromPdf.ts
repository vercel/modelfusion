import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  Run,
  SimilarTextChunksFromVectorIndexRetriever,
  generateText,
  retrieveTextChunks,
  summarizeRecursivelyWithTextGenerationAndTokenSplitting,
} from "modelfusion";
import fs from "node:fs";
import z from "zod";
import { loadPdfAsText } from "./loadPdfAsText";

export async function createTweetFromPdf({
  topic,
  pdfPath,
  exampleTweetIndexPath,
  run,
}: {
  topic: string;
  pdfPath: string;
  exampleTweetIndexPath: string;
  run: Run;
}) {
  const model = new OpenAIChatModel({ model: "gpt-4" });

  const textFromPdf = await loadPdfAsText(pdfPath);

  // extract information on topic from pdf:
  const informationOnTopic =
    await summarizeRecursivelyWithTextGenerationAndTokenSplitting(
      {
        text: textFromPdf,
        model: model.withSettings({
          temperature: 0,
          maxCompletionTokens: 1024,
        }),
        prompt: async ({ text }: { text: string }) => [
          OpenAIChatMessage.user(`## TOPIC\n${topic}`),
          OpenAIChatMessage.system(
            [
              `## ROLE`,
              `You are an expert at extracting information.`,
              `You need to extract and keep all the information on the topic above topic from the text below.`,
              `Only include information that is directly relevant for the topic.`,
            ].join("\n")
          ),
          OpenAIChatMessage.user(`## TEXT\n${text}`),
        ],
      },
      {
        functionId: "extract-information",
        run,
      }
    );

  // generate a draft tweet:
  const draftTweet = await generateText(
    model,
    [
      OpenAIChatMessage.user(`## TOPIC\n${topic}`),
      OpenAIChatMessage.system(
        [
          `## TASK`,
          `Rewrite the content below into coherent tweet on the topic above.`,
          `Include all relevant information about the topic.`,
          `Discard all irrelevant information.`,
        ].join("\n")
      ),
      OpenAIChatMessage.user(`## CONTENT\n${informationOnTopic}`),
    ],
    {
      functionId: "draft-tweet",
      settings: { temperature: 0.5 },
      run,
    }
  );

  // search for similar tweets:
  const { chunks: similarTweets } = await retrieveTextChunks(
    new SimilarTextChunksFromVectorIndexRetriever({
      vectorIndex: await MemoryVectorIndex.deserialize({
        serializedData: fs.readFileSync(exampleTweetIndexPath, "utf-8"),
        schema: z.object({ text: z.string() }),
      }),
      embeddingModel: new OpenAITextEmbeddingModel({
        model: "text-embedding-ada-002",
      }),
      maxResults: 1,
      similarityThreshold: 0.5,
    }),
    draftTweet,
    { functionId: "embed-draft-tweet", run }
  );

  if (similarTweets.length === 0) {
    return draftTweet;
  }

  // rewrite the tweet:
  return await generateText(
    model,
    [
      OpenAIChatMessage.system(
        `## TASK\nRewrite the draft tweet on ${topic} using the style from the example tweet.`
      ),
      OpenAIChatMessage.user(`## DRAFT TWEET\n${draftTweet}`),
      OpenAIChatMessage.user(`## STYLE EXAMPLE\n${similarTweets[0].text}`),
    ],
    {
      functionId: "rewrite-tweet",
      settings: { temperature: 0.5 },
      run,
    }
  );
}
