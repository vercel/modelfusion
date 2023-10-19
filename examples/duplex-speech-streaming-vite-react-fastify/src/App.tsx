import { AsyncQueue, ZodSchema, readEventSource } from "modelfusion";
import { useState } from "react";
import "./App.css";
import { convertBase64ToArrayBuffer } from "./convertBase64ToArrayBuffer";
import { eventSchema } from "./endpoint/eventSchema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    const baseUrl = "http://localhost:3001";

    setText("");

    const queue = new AsyncQueue<ArrayBuffer>();

    const mediaSource = new MediaSource();
    setAudioUrl(URL.createObjectURL(mediaSource));

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

      const audioChunkQueue: ArrayBuffer[] = [];
      let isAppending = false;

      function processAppendQueue() {
        if (!isAppending && audioChunkQueue.length > 0) {
          isAppending = true;
          const chunk = audioChunkQueue.shift();
          if (chunk != null) sourceBuffer.appendBuffer(chunk);
        }
      }

      sourceBuffer.addEventListener("updateend", () => {
        isAppending = false;
        processAppendQueue();
      });

      for await (const chunk of queue) {
        audioChunkQueue.push(chunk);
        processAppendQueue();
      }
    });

    const response = await fetch(`${baseUrl}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const path: string = (await response.json()).path;

    readEventSource({
      url: `${baseUrl}${path}`,
      schema: new ZodSchema(eventSchema),
      onEvent(event, eventSource) {
        switch (event.type) {
          case "text-chunk": {
            setText((currentText) => currentText + event.delta);
            return;
          }

          case "speech-chunk": {
            queue.push(convertBase64ToArrayBuffer(event.base64Audio));
            return;
          }

          case "finish": {
            mediaSource.endOfStream();
            eventSource.close();
            return;
          }
        }
      },
    });
  };

  return (
    <>
      <h1 className="text-4xl mb-4">Voice synthesis duplex streaming demo</h1>
      <Textarea
        className="mb-4"
        placeholder="Enter prompt."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button onClick={handleClick}>Generate response (text & speech)</Button>
      <pre className="mt-4 whitespace-pre-wrap">{text}</pre>

      {audioUrl != null && (
        <div className="flex justify-center mt-4">
          <audio
            controls
            controlsList="nodownload nofullscreen noremoteplayback"
            autoPlay={true}
            src={audioUrl}
          />
        </div>
      )}
    </>
  );
}

export default App;
