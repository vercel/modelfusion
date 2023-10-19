import { ZodSchema, readEventSource } from "modelfusion";
import { useState } from "react";
import "./App.css";
import { AudioSource } from "./AudioSource";
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

    const audioSource = new AudioSource();
    setAudioUrl(audioSource.audioUrl);

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
            audioSource.addBase64Audio(event.base64Audio);
            return;
          }

          case "finish": {
            audioSource.close();
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
