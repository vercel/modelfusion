import { Command } from "commander";
import dotenv from "dotenv";
import fs from "fs/promises";
import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  SimilarTextChunksFromVectorIndexRetriever,
  generateText,
  retrieveTextChunks,
  splitAtToken,
  splitTextChunks,
  streamText,
  throttleMaxConcurrency,
  upsertTextChunks,
} from "modelfusion";
import * as readline from "node:readline/promises";

dotenv.config();

const program = new Command();

program
  .description("Chat with a PDF file")
  .requiredOption("-f, --file <value>", "Path to PDF file")
  .parse(process.argv);

const { file }: { file: string } = program.opts();

async function main() {
  console.log("Indexing PDF...");

  const pages = await loadPdfPages(file);

  const embeddingModel = new OpenAITextEmbeddingModel({
    model: "text-embedding-ada-002",
    throttle: throttleMaxConcurrency({ maxConcurrentCalls: 5 }),
  });

  const chunks = await splitTextChunks(
    splitAtToken({
      maxTokensPerChunk: 256,
      tokenizer: embeddingModel.tokenizer,
    }),
    pages
  );

  const vectorIndex = new MemoryVectorIndex<{
    pageNumber: number;
    text: string;
  }>();

  await upsertTextChunks({ vectorIndex, embeddingModel, chunks });

  console.log("Ready.");
  console.log();

  // chat loop:
  const chat = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const question = await chat.question("You: ");

    // hypothetical document embeddings:
    const hypotheticalAnswer = await generateText(
      // use cheaper model to generate hypothetical answer:
      new OpenAIChatModel({ model: "gpt-3.5-turbo", temperature: 0 }),
      [
        OpenAIChatMessage.system(`Answer the user's question.`),
        OpenAIChatMessage.user(question),
      ]
    );

    // search for text chunks that are similar to the hypothetical answer:
    const { chunks: information } = await retrieveTextChunks(
      new SimilarTextChunksFromVectorIndexRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.75,
      }),
      hypotheticalAnswer
    );

    // answer the user's question using the retrieved information:
    const textStream = await streamText(
      // use stronger model to answer the question:
      new OpenAIChatModel({ model: "gpt-4", temperature: 0 }),
      [
        OpenAIChatMessage.system(
          // Instruct the model on how to answer:
          `Answer the user's question using only the provided information.\n` +
            // Provide some context:
            `Include the page number of the information that you are using.\n` +
            // To reduce hallucination, it is important to give the model an answer
            // that it can use when the information is not sufficient:
            `If the user's question cannot be answered using the provided information, ` +
            `respond with "I don't know".`
        ),
        OpenAIChatMessage.user(question),
        OpenAIChatMessage.functionResult(
          "getInformation",
          JSON.stringify(information)
        ),
      ]
    );

    // stream the answer to the terminal:
    process.stdout.write("\nAI : ");
    for await (const textFragment of textStream) {
      process.stdout.write(textFragment);
    }
    process.stdout.write("\n\n");
  }
}

async function loadPdfPages(path: string) {
  const data = await fs.readFile(path);

  // only load when needed (otherwise this can cause node canvas setup issues when you don't need PDFs):
  const PdfJs = await import("pdfjs-dist/legacy/build/pdf");

  const pdf = await PdfJs.getDocument({
    data,
    useSystemFonts: true, // https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
  }).promise;

  const pageTexts: Array<{
    pageNumber: number;
    text: string;
  }> = [];

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const pageContent = await page.getTextContent();

    pageTexts.push({
      pageNumber: i + 1,
      text: pageContent.items
        // limit to TextItem, extract str:
        .filter((item) => (item as any).str != null)
        .map((item) => (item as any).str as string)
        .join(" ")
        .replace(/\s+/g, " "), // reduce whitespace to single space
    });
  }

  return pageTexts;
}

main();
