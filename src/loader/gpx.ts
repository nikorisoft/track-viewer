import type { TrackData, TrackPoint, TrackSegment } from ".";

function findChildText(element: Element, tagName: string, defaultValue: string): string {
    const tags = element.getElementsByTagName(tagName);
    if (tags.length === 0 || tags[0].textContent == null) {
        return defaultValue;
    }
    return tags[0].textContent;
}

export class GPXTrackData implements TrackData {
    public creator: string;
    public segments: TrackSegment[];

    public constructor(contents: string) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(contents, "application/xml");

        if (dom.documentElement.nodeName === "parsererror") {
            throw new Error("Failed to parse XML");
        }

        this.creator = "";
        this.segments = [];

        const tracks = dom.getElementsByTagName("trk");
        for (const track of tracks) {
            const trackName = findChildText(track, "name", "Track");
            let segmentNumber = 1;

            const segments = track.getElementsByTagName("trkseg");

            for (const segment of segments) {
                const trackPoints: TrackPoint[] = [];
                const points = segment.getElementsByTagName("trkpt");
                for (const point of points) {
                    const latString = point.getAttribute("lat");
                    const lonString = point.getAttribute("lon");

                    if (latString == null || lonString == null) {
                        continue;
                    }

                    const latitude = parseFloat(latString);
                    const longitude = parseFloat(lonString);

                    const time = point.getElementsByTagName("time");
                    if (time.length === 0 || time[0].textContent == null) {
                        continue;
                    }
                    const timestamp = new Date(time[0].textContent);

                    const trackPoint: TrackPoint = {
                        latitude,
                        longitude,
                        timestamp
                    };

                    const elevations = point.getElementsByTagName("ele");
                    if (elevations.length > 0 && elevations[0].textContent != null) {
                        trackPoint.elevation = parseFloat(elevations[0].textContent)
                    }

                    trackPoints.push(trackPoint);
                }

                this.segments.push({
                    name: segments.length > 1 ? `${trackName}-${segmentNumber}` : trackName,
                    points: trackPoints
                });
                segmentNumber++;
            }
        }
    }
}
