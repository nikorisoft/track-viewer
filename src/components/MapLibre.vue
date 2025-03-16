<template lang="pug">
.map(id="main-map")
</template>

<script setup lang="ts">
import maplibregl, { Map } from "maplibre-gl";
import { onMounted, watch } from "vue";
import type { ProcessedLine, ProcessedTrack } from "@/process";
import type { TrackPoint } from "@/loader";
import { getColor, lineToInfoHTML, setResizeObserver } from "./common/map";

const props = defineProps<{
    trackData: ProcessedTrack | null;
}>();

let map: Map;

onMounted(async () => {
    map = new maplibregl.Map({
        container: "main-map",
        style: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
        center: [140, 36],
        zoom: 8,
        trackResize: true,
    });

    const div = document.getElementById("main-map")!;

    setResizeObserver(div as HTMLDivElement, () => {
        map.resize();
    });
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
    const maxSpeed = segments.reduce((prev, cur) => (prev < cur.maximumSpeed ? cur.maximumSpeed : prev), 0);

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
                        lineObject: l,
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [l.point1.longitude, l.point1.latitude],
                            [l.point2.longitude, l.point2.latitude],
                        ],
                    },
                })),
            },
        });

        map.addLayer({
            id,
            type: "line",
            source: id,
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": ["get", "color"],
                "line-width": 8,
            },
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
        padding: 20,
    });
}
</script>

<style>
@import url("maplibre-gl/dist/maplibre-gl.css");
</style>
