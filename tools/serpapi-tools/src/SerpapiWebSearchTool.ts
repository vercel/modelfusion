import { WebSearchTool } from "modelfusion";
import { getJson } from "serpapi";

export type SerpapiGoogleWebsearchToolSettings<NAME extends string> = {
  name: NAME;
  description: string;
  queryDescription?: string;

  apiKey?: string;

  num?: number;
  location?: string;
  googleDomain?: string;
  gl?: string;
  hl?: string;
  lr?: string;
  safe?: "active" | "off";
};

/**
 * @see https://serpapi.com/search-api
 */
export class SerpapiGoogleWebsearchTool<
  NAME extends string,
> extends WebSearchTool<NAME> {
  readonly settings: SerpapiGoogleWebsearchToolSettings<NAME>;

  constructor(settings: SerpapiGoogleWebsearchToolSettings<NAME>) {
    super({
      name: settings.name,
      description: settings.description,
      queryDescription: settings.queryDescription,
      execute: async ({ query }) => {
        const searchResults = await getJson({
          ...settings,
          engine: "google",
          q: query,
          api_key: this.apiKey,
        });

        const organicResults = searchResults.organic_results.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result: any) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
          })
        );

        return this.outputSchema.parse({
          results: organicResults,
        });
      },
    });

    this.settings = settings;
  }

  private get apiKey() {
    const apiKey = this.settings.apiKey ?? process.env.SERPAPI_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `SerpAPI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named SERPAPI_API_KEY.`
      );
    }

    return apiKey;
  }
}
