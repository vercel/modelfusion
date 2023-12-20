# Cloudflare Workers Example

> _Cloudflare_, _OpenAI_

Generate text on a Cloudflare Worker using ModelFusion and OpenAI.

## Usage

1. Configure `OPENAI_API_KEY`

   - For local environment: Add to `.dev.vars`
   - For cloudflare workers: Use `pnpm wrangler secret put OPENAI_API_KEY`

1. Run
   - Local environment: `pnpm dev`
   - Cloud (deployment): `pnpm deploy`
