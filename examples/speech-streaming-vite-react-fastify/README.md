# Duplex Speech Streaming (using Vite/React & ModelFusion Server/Fastify)

> _Speech Streaming_, _OpenAI_, _Elevenlabs_ _streaming_, _Vite_, _Fastify_, _ModelFusion Server_

Given a prompt, the server returns both a text and a speech stream response.

## Key files

- **Server:** `src/server/server.ts`
- **Client:** `src/App.tsx`
- **Event Schema:** `src/eventSchema.ts`

## Usage

1. Create `.env.local` file with the following content:

   ```
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   ELEVENLABS_API_KEY="YOUR_ELEVENLABS_API_KEY"
   ```

2. Increase the max completion tokens in `server.ts` (by default it generates a very short text)

3. Start the server:

   ```sh
   npm run server
   ```

4. Start the client:

   ```sh
   npm run client
   ```

5. Go to the URL from the client run
