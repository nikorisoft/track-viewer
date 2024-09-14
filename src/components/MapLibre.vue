<template lang="pug">
.map(id="main-map")
</template>

<script setup lang="ts">
import maplibregl, { Map } from "maplibre-gl";
import { onMounted, watch } from "vue";
import type { ProcessedLine, ProcessedTrack } from "@/process";
import type { TrackPoint } from "@/loader";

const props = defineProps<{
    trackData: ProcessedTrack | null,
}>();

let map: Map;

onMounted(async () => {
    map = new maplibregl.Map({
        container: "main-map",
        style: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
        center: [140, 36],
        zoom: 8,
        trackResize: true
    });

    const div = document.getElementById("main-map")!;
    const observer: ResizeObserver = new ResizeObserver((entries) => {
        for (const e of entries) {
            if (e.target === div && div.clientHeight > 0) {
                map.resize();
                observer.unobserve(div);
            }
        }
    });
    observer.observe(div);
});

watch(props, (newProps) => {
    redrawTrackData();
});

const ids: string[] = [];

function redrawTrackData() {
    if (props.trackData == null) {
        return;
    }

    if (ids.length > 0) {
        for (const id of ids) {
            map.removeLayer(id);
            map.removeSource(id);
        }
        ids.splice(0);
    }

    const bounds = new maplibregl.LngLatBounds();

    const segments = props.trackData.segments;
    const maxSpeed = segments.reduce((prev, cur) => prev < cur.maximumSpeed ? cur.maximumSpeed : prev, 0);

    for (const segment of props.trackData.segments) {
        const id = segment.getName();

        map.addSource(id, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: segment.lines.map((l) => ({
                    type: "Feature",
                    properties: {
                        color: getColor(l.speed, maxSpeed),
                        lineObject: l
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [l.point1.longitude, l.point1.latitude],
                            [l.point2.longitude, l.point2.latitude]
                        ]
                    }
                }))
            }
        });

        map.addLayer({
            id,
            type: "line",
            source: id,
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": ["get", "color"],
                "line-width": 8
            }
        });

        for (const p of segment.points) {
            bounds.extend([p.longitude, p.latitude]);
        }

        map.on("click", id, (event) => {
            if (event.features && event.features.length > 0 && event.features[0].properties) {
                const lineObj = event.features[0].properties.lineObject;
                const line = JSON.parse(lineObj) as ProcessedLine;

                const popup = new maplibregl.Popup();
                popup.setLngLat([line.point1.longitude, line.point1.latitude]);
                popup.setHTML(lineToInfoHTML(line));
                popup.addTo(map);
            }
        });

        ids.push(id);
    }

    map.fitBounds(bounds, {
        padding: 20
    });
}

function toRGB(color: number[]) {
    const r = Math.floor(color[0] * 255);
    const g = Math.floor(color[1] * 255);
    const b = Math.floor(color[2] * 255);

    return `rgb(${r}, ${g}, ${b})`
}

function getColor(speed: number, rangeMax: number) {
    const colorPoints = [[0, 0, 1], [0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 0, 0]];
    const numIntervals = colorPoints.length - 1;

    const value = speed;
    const maxValue = rangeMax;

    const relativeValue = value * numIntervals / maxValue;
    const idx = Math.floor(relativeValue);
    if (idx >= numIntervals) {
        return toRGB(colorPoints[numIntervals]);
    } else if (idx < 0) {
        return toRGB(colorPoints[0]);
    }

    const point = relativeValue - idx;

    const color = [
        colorPoints[idx][0] * (1.0 - point) + colorPoints[idx + 1][0] * point,
        colorPoints[idx][1] * (1.0 - point) + colorPoints[idx + 1][1] * point,
        colorPoints[idx][2] * (1.0 - point) + colorPoints[idx + 1][2] * point,
    ];

    return toRGB(color);
}

function lineToInfoHTML(line: ProcessedLine) {
    const point = line.point1;
    const timestamp = new Date(point.timestamp).toLocaleString();
    const speed = line.speed.toFixed(2);

    return `<p style="margin: 0">${timestamp}</p><p style="margin: 0">${speed} km/h</p>`;
}

</script>

<style>
@import url("maplibre-gl/dist/maplibre-gl.css");
</style>
