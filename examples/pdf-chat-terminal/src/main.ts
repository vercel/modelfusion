import { Command } from "commander";
import dotenv from "dotenv";
import fs from "fs/promises";
import {
  MemoryVectorIndex,
  OpenAIChatMessage,
  OpenAIChatModel,
  OpenAITextEmbeddingModel,
  VectorIndexRetriever,
  generateText,
  retrieve,
  splitAtToken,
  splitTextChunks,
  streamText,
  upsertIntoVectorIndex,
} from "modelfusion";
import * as readline from "node:readline/promises";
import * as PdfJs from "pdfjs-dist/legacy/build/pdf";

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

  await upsertIntoVectorIndex({
    vectorIndex,
    embeddingModel,
    objects: chunks,
    getText: (chunk) => chunk.text,
  });

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
    const information = await retrieve(
      new VectorIndexRetriever({
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
  // read the PDF file from disk:
  const pdfData = await fs.readFile(path);

  // parse the PDF file:
  const pdf = await PdfJs.getDocument({
    data: new Uint8Array(
      pdfData.buffer,
      pdfData.byteOffset,
      pdfData.byteLength
    ),
    useSystemFonts: true, // see https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
  }).promise;

  const pageTexts: Array<{
    pageNumber: number;
    text: string;
  }> = [];

  // extract text from each page:
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const pageContent = await page.getTextContent();
    const text = pageContent.items
      // limit to TextItem, extract str:
      .filter((item) => (item as any).str != null)
      .map((item) => (item as any).str as string)
      .join(" ")
      .replace(/\s+/g, " ") // reduce multiple whitespaces to single space
      .trim();

    if (text.length > 0)
      pageTexts.push({
        pageNumber: i + 1,
        text,
      });
  }

  return pageTexts;
}

main();
