export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
          ModelFusion / Next.js Demos
        </h2>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/generate-image" className="text-blue-500 underline">
            Image generation
          </a>
        </p>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/generate-transcription" className="text-blue-500 underline">
            Voice recording & transcription
          </a>
        </p>{" "}
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/stream-object-openai" className="text-blue-500 underline">
            Object streaming through Server with OpenAI
          </a>
        </p>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          <a href="/stream-object-ollama" className="text-blue-500 underline">
            Object streaming on Client with Ollama
          </a>
        </p>
      </div>
    </main>
  );
}
