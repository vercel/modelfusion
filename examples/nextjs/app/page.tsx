export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
          ModelFusion / Next.js Demos
        </h2>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/generate-image" className="text-blue-500 underline">
            Generate images in the style of 19th century paintings.
          </a>
        </p>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/generate-transcription" className="text-blue-500 underline">
            Voice recording & transcription.
          </a>
        </p>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a
            href="/stream-structure-ollama"
            className="text-blue-500 underline"
          >
            Structure streaming with Ollama (City Travel Itinerary Planner)
          </a>
        </p>
      </div>
    </main>
  );
}
