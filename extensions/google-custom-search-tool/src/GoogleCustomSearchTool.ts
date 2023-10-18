import { WebSearchTool } from "modelfusion";

export type GoogleCustomSearchToolSettings<NAME extends string> = {
  name: NAME;
  description: string;
  queryDescription?: string;

  apiKey?: string;

  searchEngineId: string;
  maxResults?: number;
};

/**
 * A tool for searching the web using Google Custom Search.
 *
 * @see https://developers.google.com/custom-search/v1/using_rest
 */
export class GoogleCustomSearchTool<
  NAME extends string,
> extends WebSearchTool<NAME> {
  readonly settings: GoogleCustomSearchToolSettings<NAME>;

  constructor(settings: GoogleCustomSearchToolSettings<NAME>) {
    super({
      name: settings.name,
      description: settings.description,
      queryDescription: settings.queryDescription,
      execute: async ({ query }) => {
        const { apiKey } = this;

        const result = await fetch(
          `https://www.googleapis.com/customsearch/v1/siterestrict?key=${apiKey}&cx=${this.settings.searchEngineId}&q=${query}`
        );

        const data = await result.json();

        const items = data.items.slice(0, this.settings.maxResults ?? 5);

        const validationResult = this.outputSchema.validate({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results: items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })),
        });

        if (!validationResult.success) {
          throw validationResult.error;
        }

        return validationResult.data;
      },
    });

    this.settings = settings;
  }

  private get apiKey() {
    const apiKey =
      this.settings.apiKey ?? process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `Google Custom Search API key is missing. ` +
          `Pass it as an argument to the constructor or set it as an environment variable named GOOGLE_CUSTOM_SEARCH_API_KEY.`
      );
    }

    return apiKey;
  }
}
