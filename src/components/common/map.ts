import type { ProcessedLine } from "@/process";

export function setResizeObserver(div: HTMLDivElement, mapResizeHandler: () => void) {
    const observer: ResizeObserver = new ResizeObserver((entries) => {
        for (const e of entries) {
            if (e.target === div && div.clientHeight > 0) {
                mapResizeHandler();
                observer.unobserve(div);
            }
        }
    });
    observer.observe(div);
}

export function toRGB(color: number[]) {
    const r = Math.floor(color[0] * 255);
    const g = Math.floor(color[1] * 255);
    const b = Math.floor(color[2] * 255);

    return `rgb(${r}, ${g}, ${b})`;
}

export function getColor(speed: number, rangeMax: number) {
    const colorPoints = [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
    ];
    const numIntervals = colorPoints.length - 1;

    const value = speed;
    const maxValue = rangeMax;

    const relativeValue = (value * numIntervals) / maxValue;
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

export function lineToInfoHTML(line: ProcessedLine) {
    const point = line.point1;
    const timestamp = new Date(point.timestamp).toLocaleString();
    const speed = line.speed.toFixed(2);

    let str = `<p style="margin: 0">${timestamp}</p><p style="margin: 0">${speed} km/h</p>`;

    if (line.point1.speed != null) {
        const recordedSpeed = line.point1.speed.toFixed(2);
        str += `<p style="margin: 0">(Recorded: ${recordedSpeed} km/h)</p>`;
    }
    if (line.point1.elevation != null) {
        const elevation = line.point1.elevation.toFixed(2);
        str += `<p style="margin: 0">${elevation} m</p>`;
    }

    return str;
}
