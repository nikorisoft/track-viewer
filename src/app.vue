<template lang="pug">
.uk-container.uk-container-xlarge.uk-padding.uk-flex.uk-flex-column.uk-flex-between(uk-height-viewport)
    .uk-flex.uk-flex-between
        h1 Track Viewer
        .buttons
            button.uk-button(@click="openUploadDialog") Upload
            input.uk-hidden(type="file", id="upload_file", @change="onFileChanged")

    MapComponent(style="flex-grow: 1", :trackData="trackData", @dragover="onDragover", @drop="onDrop")

    .copyright
        .uk-text-muted.uk-text-right {{ softwareName }} - Copyright &copy; nikorisoft 2023-2024
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import UIkit from "uikit";

import MapComponent from "./components/MapLibre.vue";
import { load, type TrackData } from "./loader";
import { ProcessedTrack } from "./process";
import version from "./version";

const trackData = ref<ProcessedTrack | null>(null);

const softwareName = computed(() => {
    if (version.status !== "") {
        return `${version.name} (Release ${version.release} - ${version.status})`;
    } else {
        return `${version.name} (Release ${version.release})`;
    }
});

async function onFileChanged(params: Event) {
    const files = params.target as HTMLInputElement;
    if (files.files != null) {
        const file = files.files[0];
        const text = await file.text();
        const data = await file.arrayBuffer();

        let rawData: TrackData;
        try {
            rawData = load(text, data);
        } catch (err) {
            UIkit.notification("Failed to parse the uploaded file", { status: "danger" });
            return;
        }

        trackData.value = new ProcessedTrack(rawData);
    }
}

function openUploadDialog() {
    const input = document.getElementById("upload_file") as HTMLInputElement;

    input.click();
}

function onDragover(ev: DragEvent) {
    console.log("onDragover");
    ev.preventDefault();
}

async function onDrop(ev: DragEvent) {
    console.log("onDrop");
    ev.preventDefault();

    if (ev.dataTransfer == null) {
        return;
    }

    let file;
    if (ev.dataTransfer.items != null) {
        file = ev.dataTransfer.items[0].getAsFile();
    } else {
        file = ev.dataTransfer.files.item(0);
    }

    if (file == null) {
        return;
    }

    const text = await file.text();
    const data = await file.arrayBuffer();

    let rawData: TrackData;
    try {
        rawData = load(text, data);
    } catch (err) {
        UIkit.notification("Failed to parse the uploaded file", { status: "danger" });
        return;
    }

    trackData.value = new ProcessedTrack(rawData);
}
</script>

<style>
@import url("uikit/dist/css/uikit.min.css");
</style>
