export const FILL_COLOR_DARK  = "#222";
export const FILL_COLOR_LIGHT = "#ddd";
export const STROKE_COLOR     = "#000";
export const STROKE_OPACITY   = 0.02;
export const OPACITY_MIN      = 0.02;
export const OPACITY_MAX      = 0.15;

export interface IPatternOption {
    hash: string;
    color: string;
    baseColor: string;
    generator: string;
}

/**
 * Extract a substring from a hex string and parse it as an integer
 * @param {string} hash - Source hex string
 * @param {number} index - Start index of substring
 * @param {number} [length] - Length of substring. Defaults to 1.
 */
export function hexVal(hash: string, index: number, len?: number) {
    return parseInt(hash.substr(index, len || 1), 16);
}

/*
 * Re-maps a number from one range to another
 * http://processing.org/reference/map_.html
 */
export function map(value: string | number, vMin: number, vMax: number, dMin: number, dMax: number) {
    const vValue = typeof value === "number" ? value : parseFloat(value);
    const vRange = vMax - vMin;
    const dRange = dMax - dMin;

    return (vValue - vMin) * dRange / vRange + dMin;
}

export function fillColor(val: number) {
    return (val % 2 === 0) ? FILL_COLOR_LIGHT : FILL_COLOR_DARK;
}

export function fillOpacity(val: number) {
    return map(val, 0, 15, OPACITY_MIN, OPACITY_MAX);
}
