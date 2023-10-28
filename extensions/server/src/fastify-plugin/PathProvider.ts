export class PathProvider {
  constructor(readonly basePath: string) {}

  getAssetPath(runId: string, assetName: string) {
    return `${this.basePath}/${runId}/assets/${assetName}`;
  }

  getAssetPathTemplate() {
    return `${this.basePath}/:runId/assets/:assetName`;
  }

  getEventsPath(runId: string) {
    return `${this.basePath}/${runId}/events`;
  }

  getEventsPathTemplate() {
    return `${this.basePath}/:runId/events`;
  }
}
