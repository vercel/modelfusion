import { ZodSchema, readEventSource } from "modelfusion";
import { useState } from "react";
import "./App.css";
import { eventSchema } from "./endpoint/eventSchema";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

function App() {
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    const baseUrl = "http://localhost:3001";

    const mediaSource = new MediaSource();

    setText("");
    setAudioUrl(URL.createObjectURL(mediaSource));

    let isAppending = false;
    let appendQueue: ArrayBuffer[] = [];

    mediaSource.addEventListener("sourceopen", async () => {
      const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

      function processAppendQueue() {
        if (!isAppending && appendQueue.length > 0) {
          isAppending = true;
          const chunk = appendQueue.shift();

          chunk && sourceBuffer.appendBuffer(chunk);
        }
      }

      sourceBuffer.addEventListener("updateend", () => {
        isAppending = false;
        processAppendQueue();
      });

      function appendChunk(chunk: ArrayBuffer) {
        appendQueue.push(chunk);
        processAppendQueue();
      }

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
            case "finish": {
              mediaSource.endOfStream();
              eventSource.close();
              return;
            }

            case "text-chunk": {
              setText((currentText) => currentText + event.delta);
              return;
            }

            case "speech-chunk": {
              const binary = atob(event.base64Audio);
              const length = binary.length;
              const buffer = new ArrayBuffer(length);
              const view = new Uint8Array(buffer);
              for (let i = 0; i < length; i++) {
                view[i] = binary.charCodeAt(i);
              }
              appendChunk(buffer);
              return;
            }
          }
        },
      });
    });
  };

  return (
    <>
      <h3 className="mb-4">Generate Voice Answer</h3>
      <Textarea
        className="mb-4"
        placeholder="Enter prompt."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button onClick={handleClick}>Send</Button>
      <div className="mt-4">{text}</div>

      {audioUrl != null && (
        <audio
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          autoPlay={true}
          src={audioUrl}
        />
      )}
    </>
  );
}

export default App;
