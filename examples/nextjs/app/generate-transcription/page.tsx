"use client";

import { Button } from "@/components/ui/button";
import { MicIcon } from "@/components/ui/mic-icon";
import { getAudioFileExtension } from "modelfusion";
import { useRef, useState } from "react";

export default function () {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  const startRecording = () => {
    if (isRecording) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        // .start(1000): workaround for Safari/iphone
        // see https://community.openai.com/t/whisper-api-completely-wrong-for-mp4/289256/12
        mediaRecorder.start(1000);

        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const finishRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && isRecording) {
      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append(
            "audio",
            new Blob(audioChunksRef.current, {
              type: mediaRecorder.mimeType,
            }),
            `audio.${getAudioFileExtension(mediaRecorder.mimeType)}`
          );

          const response = await fetch("/api/generate-transcription", {
            method: "POST",
            body: formData,
          });

          const transcription = await response.json();

          setTranscriptions((previousTranscriptions) => [
            ...previousTranscriptions,
            transcription,
          ]);
        } finally {
          setIsTranscribing(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorder.stop();
      mediaRecorder.stream?.getTracks().forEach((track) => track.stop()); // stop microphone access

      setIsRecording(false);
    }
  };

  const buttonStatus = isTranscribing
    ? "Transcribing..."
    : isRecording
      ? "Recording... Click to stop"
      : "Click to record";

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
          Audio Recorder
        </h2>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Record audio snippets and generate transcriptions.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 pt-6">
        <Button
          className="w-24 h-24 rounded-full border-4 border-red-500 text-red-500 dark:border-red-400 dark:text-red-400"
          size="lg"
          variant="outline"
          onClick={isRecording ? finishRecording : startRecording}
          onContextMenu={(e) => e.preventDefault()}
          disabled={isTranscribing}
        >
          <MicIcon className="h-8 w-8" />
        </Button>
        {buttonStatus}
        <h2 className="text-2xl font-semibold">Recorded Audio Snippets</h2>
      </div>
      <div className="w-full max-w-2xl mx-auto mt-8">
        {transcriptions.map((transcription, index) => (
          <div key={index} className="py-2">
            <div className="flex justify-between items-center">
              {transcription}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
