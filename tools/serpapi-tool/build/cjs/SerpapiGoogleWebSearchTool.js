"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpapiGoogleWebSearchTool = void 0;
const modelfusion_1 = require("modelfusion");
const serpapi_1 = require("serpapi");
/**
 * A tool for searching the web using SerpAPI.
 *
 * @see https://serpapi.com/search-api
 */
class SerpapiGoogleWebSearchTool extends modelfusion_1.WebSearchTool {
    constructor(settings) {
        super({
            name: settings.name,
            description: settings.description,
            queryDescription: settings.queryDescription,
            execute: async ({ query }) => {
                const searchResults = await (0, serpapi_1.getJson)({
                    ...settings,
                    engine: "google",
                    q: query,
                    api_key: this.apiKey,
                });
                const organicResults = searchResults.organic_results.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (result) => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                }));
                const validationResult = this.returnType.validate({
                    results: organicResults,
                });
                if (!validationResult.success) {
                    throw validationResult.error;
                }
                return validationResult.data;
            },
        });
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.settings = settings;
    }
    get apiKey() {
        const apiKey = this.settings.apiKey ?? process.env.SERPAPI_API_KEY;
        if (apiKey == null) {
            throw new Error(`SerpAPI API key is missing. Pass it as an argument to the constructor or set it as an environment variable named SERPAPI_API_KEY.`);
        }
        return apiKey;
    }
}
exports.SerpapiGoogleWebSearchTool = SerpapiGoogleWebSearchTool;
