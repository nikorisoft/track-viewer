import { GPXTrackData } from "./gpx";

export interface TrackPoint {
    latitude: number;
    longitude: number;
    elevation?: number;
    speed?: number;
    timestamp: Date;
}

export interface TrackSegment {
    name: string;
    points: TrackPoint[];
}

export interface TrackData {
    creator: string;
    segments: TrackSegment[];
}

export function load(text: string, binary: ArrayBuffer): TrackData {
    try {
        return new GPXTrackData(text);
    } catch (e) {
        console.error(e);
    }
}
