import { distance } from "@turf/turf";
import type { TrackData, TrackPoint, TrackSegment } from "@/loader";

export interface ProcessedLine {
    point1: TrackPoint;
    point2: TrackPoint;

    distance: number;
    speed: number;
    duration: number;
}

export class ProcessedSegment {
    rawData: TrackSegment;
    points: TrackPoint[];
    lines: ProcessedLine[];

    maximumSpeed: number;

    public constructor(data: TrackSegment) {
        this.rawData = data;

        this.points = this.rawData.points;
        this.lines = [];

        let maximumSpeed = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];

            const distanceInMeter = distance([p1.longitude, p1.latitude], [p2.longitude, p2.latitude], {
                units: "meters",
            });
            const duration = p2.timestamp.getTime() - p1.timestamp.getTime();
            const speed = (distanceInMeter * 3.6 * 1000.0) / duration;

            this.lines.push({
                point1: p1,
                point2: p2,
                distance: distanceInMeter,
                speed, // km/h
                duration,
            });

            if (maximumSpeed < speed) {
                maximumSpeed = speed;
            }
        }

        this.maximumSpeed = maximumSpeed;
    }

    public getName() {
        return this.rawData.name;
    }
}

export class ProcessedTrack {
    rawData: TrackData;

    segments: ProcessedSegment[];

    public constructor(data: TrackData) {
        this.rawData = data;

        this.segments = data.segments.map((s) => new ProcessedSegment(s));
    }
}
