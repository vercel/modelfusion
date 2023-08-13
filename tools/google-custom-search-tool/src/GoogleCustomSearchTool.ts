import { WebSearchTool } from "modelfusion";

export type GoogleCustomSearchToolSettings = {
  description: string;
  apiKey?: string;
  cx?: string;
  maxResults?: number;
};

/**
 * @see https://developers.google.com/custom-search/v1/using_rest
 */
export class GoogleCustomSearchTool<
  NAME extends string,
> extends WebSearchTool<NAME> {
  readonly settings: GoogleCustomSearchToolSettings;

  constructor(name: NAME, settings: GoogleCustomSearchToolSettings) {
    super({
      name,
      description: settings.description,
      execute: async ({ query }) => {
        const { cx, apiKey } = this;

        const result = await fetch(
          `https://www.googleapis.com/customsearch/v1/siterestrict?key=${apiKey}&cx=${cx}&q=${query}`
        );

        const data = await result.json();

        const items = data.items.slice(0, this.settings.maxResults ?? 5);

        return WebSearchTool.OUTPUT_SCHEMA.parse({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          results: items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })),
        });
      },
    });

    this.settings = settings;
  }

  private get apiKey() {
    const apiKey =
      this.settings.apiKey ?? process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;

    if (apiKey == null) {
      throw new Error(
        `GOOGLE_CUSTOM_SEARCH API key is missing. ` +
          `Pass it as an argument to the constructor or set it as an environment variable named GOOGLE_CUSTOM_SEARCH_API_KEY.`
      );
    }

    return apiKey;
  }

  private get cx() {
    const cx = this.settings.cx ?? process.env.GOOGLE_CUSTOM_SEARCH_CX;

    if (cx == null) {
      throw new Error(
        `GOOGLE_CUSTOM_SEARCH cx setting is missing. ` +
          `Pass it as an argument to the constructor or set it as an environment variable named GOOGLE_CUSTOM_SEARCH_CX.`
      );
    }

    return cx;
  }
}
