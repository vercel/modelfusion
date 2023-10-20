# Cloudflare Workers Example

> _Cloudflare_, _OpenAI_

Generate text on a Cloudflare Worker using ModelFusion and OpenAI.

## Usage

1. Configure `OPENAI_API_KEY`

   - For local environment: Add to `.dev.vars`
   - For cloudflare workers: Use `npx wrangler secret put OPENAI_API_KEY`

1. Run
   - Local environment: `npm run dev`
   - Cloud (deployment): `npm run deploy`
