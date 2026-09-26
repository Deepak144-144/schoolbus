import { BusPosition, RouteInfo, DemoBusRoute } from "../types";

const SIMULATION_SPEED_FACTOR = 1;

export class GPSSimulator {
  private route: DemoBusRoute;
  private currentStopIndex: number = 0;
  private nextStopIndex: number = 1;
  private position: { lat: number; lng: number } | null = null;
  private heading: number = 0;
  private speed: number = 0;
  private isRunning: boolean = false;
  private lastUpdateTime: number = 0;
  private interpolatedPosition: { lat: number; lng: number } = { lat: 0, lng: 0 };
  private distanceToNextStop: number = 0;
  private totalDistance: number = 0;
  private completedDistance: number = 0;
  private progress: number = 0;
  private busNumber: string;

  constructor(route: DemoBusRoute, busNumber: string = "12") {
    this.route = route;
    this.busNumber = busNumber;
    this.position = { ...route.stops[0] };
    this.interpolatedPosition = { ...route.stops[0] };
    this.calculateTotalDistance();
  }

  private calculateTotalDistance(): void {
    let total = 0;
    for (let i = 0; i < this.route.stops.length - 1; i++) {
      total += this.getDistance(
        this.route.stops[i],
        this.route.stops[i + 1]
      );
    }
    this.totalDistance = total;
  }

  private getDistance(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
  ): number {
    const R = 6371e3;
    const dLat = this.toRad(b.lat - a.lat);
    const dLon = this.toRad(b.lng - a.lng);
    const lat1 = this.toRad(a.lat);
    const lat2 = this.toRad(b.lat);
    const haversine =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private calculateHeading(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const dLon = this.toRad(to.lng - from.lng);
    const y = Math.sin(dLon) * Math.cos(this.toRad(to.lat));
    const x =
      Math.cos(this.toRad(from.lat)) * Math.sin(this.toRad(to.lat)) -
      Math.sin(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) * Math.cos(dLon);
    const heading = (Math.atan2(y, x) * 180) / Math.PI;
    return (heading + 360) % 360;
  }

  start(): void {
    this.isRunning = true;
    this.lastUpdateTime = Date.now();
  }

  stop(): void {
    this.isRunning = false;
  }

  getPosition(): BusPosition {
    const now = Date.now();
    if (!this.isRunning) {
      return {
        id: `bus-${this.busNumber}`,
        busNumber: this.busNumber,
        lat: this.interpolatedPosition.lat,
        lng: this.interpolatedPosition.lng,
        speed: 0,
        heading: this.heading,
        timestamp: this.lastUpdateTime,
        status: "stopped",
        isDemo: true,
      };
    }

    const deltaTime = (now - this.lastUpdateTime) / 1000;
    const speedMps = this.speed || (this.isRunning ? 15 : 0);

    const distanceThisFrame = (speedMps * deltaTime * SIMULATION_SPEED_FACTOR);

    this.completedDistance += distanceThisFrame;

    if (this.progress < 1) {
      const remaining = this.route.stops.length - this.currentStopIndex - 1;
      if (remaining > 0) {
        const segmentDistance = this.getDistance(
          this.route.stops[this.currentStopIndex],
          this.route.stops[this.currentStopIndex + 1]
        );
        this.distanceToNextStop = segmentDistance - this.completedDistance;

        if (this.distanceToNextStop <= 0) {
          this.currentStopIndex++;
          this.completedDistance = -this.distanceToNextStop;
          this.nextStopIndex = this.currentStopIndex + 1;
          this.speed = 0;
        }
      }
    }

    const totalProgress = this.completedDistance / this.totalDistance;
    this.progress = Math.min(totalProgress, 1);

    const segmentStart = this.route.stops[this.currentStopIndex];
    const segmentEnd = this.route.stops[Math.min(this.currentStopIndex + 1, this.route.stops.length - 1)];

    if (segmentStart && segmentEnd) {
      const segmentDist = this.getDistance(segmentStart, segmentEnd);
      const segProgress = segmentDist > 0 ? Math.min(this.completedDistance / segmentDist, 1) : 0;

      this.interpolatedPosition = {
        lat: segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * segProgress,
        lng: segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * segProgress,
      };

      this.heading = this.calculateHeading(segmentStart, segmentEnd);
      this.speed = this.isRunning && segProgress < 0.95 ? 25 + Math.random() * 10 : 0;
    }

    this.lastUpdateTime = now;

    return {
      id: `bus-${this.busNumber}`,
      busNumber: this.busNumber,
      lat: this.interpolatedPosition.lat,
      lng: this.interpolatedPosition.lng,
      speed: Math.round(this.speed),
      heading: Math.round(this.heading),
      timestamp: now,
      status: this.speed > 1 ? "moving" : "stopped",
      isDemo: true,
    };
  }

  getCurrentStop(): string {
    return this.route.stops[this.currentStopIndex]?.stopName || "School";
  }

  getNextStop(): string {
    const nextIdx = this.currentStopIndex + 1;
    return this.route.stops[nextIdx]?.stopName || "Destination reached";
  }

  getProgress(): number {
    return Math.min(this.progress, 1);
  }

  getCompletedStops(): number {
    return this.currentStopIndex;
  }

  getTotalStops(): number {
    return this.route.stops.length;
  }

  getDistanceToNextStop(): number {
    return Math.max(0, this.distanceToNextStop);
  }

  getEta(): number {
    return Math.max(0, Math.round(this.distanceToNextStop / (this.speed || 20) * 60));
  }

  isAtStop(): boolean {
    return this.speed === 0 && this.isRunning;
  }

  isDemo(): boolean {
    return true;
  }
}
