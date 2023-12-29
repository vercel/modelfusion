import { WebSearchTool } from "modelfusion";
export type SerpapiGoogleWebSearchToolSettings<NAME extends string> = {
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
 * A tool for searching the web using SerpAPI.
 *
 * @see https://serpapi.com/search-api
 */
export declare class SerpapiGoogleWebSearchTool<NAME extends string> extends WebSearchTool<NAME> {
    readonly settings: SerpapiGoogleWebSearchToolSettings<NAME>;
    constructor(settings: SerpapiGoogleWebSearchToolSettings<NAME>);
    private get apiKey();
}
