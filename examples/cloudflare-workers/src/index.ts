import { generateText, OpenAIApiConfiguration, OpenAITextGenerationModel } from 'modelfusion';

export interface Env {
	OPENAI_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const text = await generateText(
			new OpenAITextGenerationModel({
				api: new OpenAIApiConfiguration({ apiKey: env.OPENAI_API_KEY }),
				model: 'gpt-3.5-turbo-instruct',
				temperature: 0.7,
				maxCompletionTokens: 50,
			}).withInstructionPrompt(),
			{ instruction: 'Write a short story about a robot learning to love' },
		);

		return new Response(text);
	},
};
