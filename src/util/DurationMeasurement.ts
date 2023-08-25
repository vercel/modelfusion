export function startDurationMeasurement(): DurationMeasurement {
  // certain environments may not have the performance API:
  return globalThis.performance != null
    ? new PerformanceNowDurationMeasurement()
    : new DateDurationMeasurement();
}

export interface DurationMeasurement {
  startEpochSeconds: number;
  startDate: Date;
  durationInMs: number;
}

class PerformanceNowDurationMeasurement implements DurationMeasurement {
  private readonly startTime = globalThis.performance.now();

  get startEpochSeconds() {
    return Math.floor(
      (globalThis.performance.timeOrigin + this.startTime) / 1000
    );
  }

  get startDate() {
    return new Date(this.startEpochSeconds * 1000);
  }

  get durationInMs() {
    return Math.ceil(globalThis.performance.now() - this.startTime);
  }
}

class DateDurationMeasurement implements DurationMeasurement {
  private readonly startTime = Date.now();

  get startEpochSeconds() {
    return Math.floor(this.startTime / 1000);
  }

  get startDate() {
    return new Date(this.startTime);
  }

  get durationInMs() {
    return Date.now() - this.startTime;
  }
}
