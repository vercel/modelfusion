import {
  OpenAIApiConfiguration,
  generateTranscription,
  openai,
} from "modelfusion";
import { getAudioFileExtension } from "modelfusion-experimental";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (audioFile == null || typeof audioFile === "string") {
      return new Response("No file data provided", { status: 400 });
    }

    const fileData = await audioFile.arrayBuffer();

    const transcription = await generateTranscription({
      model: openai.Transcriber({
        // explicit API configuration needed for NextJS environment
        // (otherwise env variables are not available):
        api: new OpenAIApiConfiguration({
          apiKey: process.env.OPENAI_API_KEY,
        }),
        model: "whisper-1",
      }),
      data: {
        type: getAudioFileExtension(audioFile.type),
        data: new Uint8Array(fileData),
      },
    });

    return Response.json(transcription);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}
