export class PathProvider {
  readonly baseUrl: string;
  readonly basePath: string;

  constructor({ baseUrl, basePath }: { baseUrl: string; basePath: string }) {
    this.baseUrl = baseUrl;
    this.basePath = basePath;
  }

  getAssetUrl(runId: string, assetName: string) {
    return `${this.baseUrl}/${this.basePath}/${runId}/assets/${assetName}`;
  }

  getAssetPathTemplate() {
    return `${this.basePath}/:runId/assets/:assetName`;
  }

  getEventsUrl(runId: string) {
    return `${this.baseUrl}/${this.basePath}/${runId}/events`;
  }

  getEventsPathTemplate() {
    return `${this.basePath}/:runId/events`;
  }
}
