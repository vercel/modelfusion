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
export declare class GoogleCustomSearchTool<NAME extends string> extends WebSearchTool<NAME> {
    readonly settings: GoogleCustomSearchToolSettings<NAME>;
    constructor(settings: GoogleCustomSearchToolSettings<NAME>);
    private get apiKey();
}
