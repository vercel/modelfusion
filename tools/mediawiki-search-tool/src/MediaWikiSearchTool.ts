import { WebSearchTool, parseJSON, zodSchema } from "modelfusion";
import z from "zod";

export type MediaWikiSearchToolSettings<NAME extends string> = {
  name: NAME;

  /**
   * URL of the search API, e.g. "https://en.wikipedia.org/w/api.php",
   */
  url: string;

  description: string;
  queryDescription?: string;

  maxResults?: number;

  namespace?: string;
  profile?:
    | "strict"
    | "normal"
    | "fuzzy"
    | "fast-fuzzy"
    | "classic"
    | "engine_autoselect";
  redirect?: "return" | "resolve";
};

/**
 * A tool for searching MediaWiki using the official API.
 * This tool can be used to e.g. search Wikipedia.
 *
 * @see https://en.wikipedia.org/w/api.php?action=help&modules=opensearch
 */
export class MediaWikiSearchTool<
  NAME extends string,
> extends WebSearchTool<NAME> {
  readonly settings: MediaWikiSearchToolSettings<NAME>;

  constructor(settings: MediaWikiSearchToolSettings<NAME>) {
    super({
      name: settings.name,
      description: settings.description,
      queryDescription: settings.queryDescription,
      execute: async ({ query }) => {
        let url = `${this.settings.url}?origin=*&action=opensearch&format=json&search=${query}`;

        if (this.settings.namespace) {
          url += `&namespace=${this.settings.namespace}`;
        }

        if (this.settings.maxResults) {
          url += `&limit=${this.settings.maxResults}`;
        }

        if (this.settings.profile) {
          url += `&profile=${this.settings.profile}`;
        }

        if (this.settings.redirect) {
          url += `&redirect=${this.settings.redirect}`;
        }

        const result = await fetch(url);

        const data = parseJSON({
          text: await result.text(),
          schema: zodSchema(
            z.tuple([
              z.string(),
              z.array(z.string()),
              z.array(z.string()),
              z.array(z.string()),
            ])
          ),
        });

        const pageTitles = data[1];
        const pageDescriptions = data[2];
        const pageLinks = data[3];

        const results = pageTitles.map((title, index) => ({
          title,
          snippet: pageDescriptions[index],
          link: pageLinks[index],
        }));

        return { results };
      },
    });

    this.settings = settings;
  }
}
