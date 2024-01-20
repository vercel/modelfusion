"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function () {
  const [inputValue, setInputValue] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setImageSrc(null);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (response.ok) {
        const image = await response.json();
        setImageSrc(`data:image/png;base64,${image}`);
        return;
      }

      const errorText = await response.text();
      setError(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
          Image Generator
        </h2>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Generate images in the style of 19th century paintings.
        </p>
      </div>
      <div className="w-full max-w-sm space-y-2 pt-6 pb-8">
        <form className="flex space-x-2" onSubmit={handleSubmit}>
          <Input
            className="max-w-lg flex-1"
            placeholder="Describe the image"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Generate
          </Button>
        </form>
      </div>
      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="w-[512px] h-[512px] space-y-2">
        {isLoading ? (
          <Skeleton className="h-[512px] w-[512px]" />
        ) : (
          imageSrc && (
            <img
              alt="Generated Image"
              className="overflow-hidden rounded-lg object-cover"
              src={imageSrc}
            />
          )
        )}
      </div>
    </div>
  );
}
