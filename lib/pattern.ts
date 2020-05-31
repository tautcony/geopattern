"use strict";

import * as assign from "object-assign";
import * as color from "./color";
import sha1 from "./sha1";
import SVG from "./svg";

export interface IOption {
    hash: string;
    color: string;
    baseColor: string;
    generator: string;
}

const DEFAULTS = {
    baseColor: "#933c3c",
};

const PATTERNS = [
    "octogons",
    "overlappingCircles",
    "plusSigns",
    "xes",
    "sineWaves",
    "hexagons",
    "overlappingRings",
    "plaid",
    "triangles",
    "squares",
    "concentricCircles",
    "diamonds",
    "tessellation",
    "nestedSquares",
    "mosaicSquares",
    "chevrons",
];

const FILL_COLOR_DARK  = "#222";
const FILL_COLOR_LIGHT = "#ddd";
const STROKE_COLOR     = "#000";
const STROKE_OPACITY   = 0.02;
const OPACITY_MIN      = 0.02;
const OPACITY_MAX      = 0.15;


// Helpers

/**
 * Extract a substring from a hex string and parse it as an integer
 * @param {string} hash - Source hex string
 * @param {number} index - Start index of substring
 * @param {number} [length] - Length of substring. Defaults to 1.
 */
function hexVal(hash: string, index: number, len?: number) {
    return parseInt(hash.substr(index, len || 1), 16);
}

/*
 * Re-maps a number from one range to another
 * http://processing.org/reference/map_.html
 */
function map(value: string | number, vMin: number, vMax: number, dMin: number, dMax: number) {
    const vValue = typeof value === "number" ? value : parseFloat(value);
    const vRange = vMax - vMin;
    const dRange = dMax - dMin;

    return (vValue - vMin) * dRange / vRange + dMin;
}

function fillColor(val: number) {
    return (val % 2 === 0) ? FILL_COLOR_LIGHT : FILL_COLOR_DARK;
}

function fillOpacity(val: number) {
    return map(val, 0, 15, OPACITY_MIN, OPACITY_MAX);
}

export default class Pattern {
    private opts: IOption;
    private hash: string;
    private svg: SVG;
    private color: string;

    public constructor(str: string, options?: IOption) {
        this.opts = assign({}, DEFAULTS, options);
        this.hash = this.opts.hash || sha1(str);
        this.svg = new SVG();

        this.generateBackground();
        this.generatePattern();
    }


    public toSvg() {
        return this.svg.toString();
    };

    public toString() {
        return this.toSvg();
    };

    public toBase64() {
        const str = this.toSvg();
        let b64;

        // Use window.btoa if in the browser; otherwise fallback to node buffers
        if (typeof window !== "undefined" && typeof window.btoa === "function") {
            b64 = window.btoa(str);
        } else {
            b64 = new Buffer(str).toString("base64");
        }

        return b64;
    };

    public toDataUri() {
        return "data:image/svg+xml;base64," + this.toBase64();
    };

    public toDataUrl() {
        return 'url("' + this.toDataUri() + '")';
    };

    public generateBackground() {
        let baseColor; let hueOffset; let rgb; let satOffset;

        if (this.opts.color) {
            rgb = color.hex2rgb(this.opts.color);
        } else {
            hueOffset = map(hexVal(this.hash, 14, 3), 0, 4095, 0, 359);
            satOffset = hexVal(this.hash, 17);
            baseColor = color.rgb2hsl(color.hex2rgb(this.opts.baseColor));

            baseColor.h = (((baseColor.h * 360 - hueOffset) + 360) % 360) / 360;

            if (satOffset % 2 === 0) {
                baseColor.s = Math.min(1, ((baseColor.s * 100) + satOffset) / 100);
            } else {
                baseColor.s = Math.max(0, ((baseColor.s * 100) - satOffset) / 100);
            }
            rgb = color.hsl2rgb(baseColor);
        }

        this.color = color.rgb2hex(rgb);

        this.svg.rect(0, 0, "100%", "100%", {
            fill: color.rgb2rgbString(rgb),
        });
    };

    public generatePattern() {
        let generator = this.opts.generator;

        if (generator) {
            if (PATTERNS.indexOf(generator) < 0) {
                throw new Error("The generator "
				+ generator
				+ " does not exist.");
            }
        } else {
            generator = PATTERNS[hexVal(this.hash, 20)];
        }

        return this["geo" + generator.slice(0, 1).toUpperCase() + generator.slice(1)]();
    };

    public geoHexagons() {
        const scale      = hexVal(this.hash, 0);
        const sideLength = map(scale, 0, 15, 8, 60);
        const hexHeight  = sideLength * Math.sqrt(3);
        const hexWidth   = sideLength * 2;
        const hex        = PatternBuilder.buildHexagonShape(sideLength);
        let dy; let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(hexWidth * 3 + sideLength * 3);
        this.svg.setHeight(hexHeight * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                dy      = x % 2 === 0 ? y * hexHeight : y * hexHeight + hexHeight / 2;
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };

                this.svg.polyline(hex, styles).transform({
                    translate: [
                        x * sideLength * 1.5 - hexWidth / 2,
                        dy - hexHeight / 2,
                    ],
                });

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            6 * sideLength * 1.5 - hexWidth / 2,
                            dy - hexHeight / 2,
                        ],
                    });
                }

                // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    dy = x % 2 === 0 ? 6 * hexHeight : 6 * hexHeight + hexHeight / 2;
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            x * sideLength * 1.5 - hexWidth / 2,
                            dy - hexHeight / 2,
                        ],
                    });
                }

                // Add an extra one at bottom-right, for tiling.
                if (x === 0 && y === 0) {
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            6 * sideLength * 1.5 - hexWidth / 2,
                            5 * hexHeight + hexHeight / 2,
                        ],
                    });
                }

                i++;
            }
        }
    };

    public geoSineWaves() {
        const period    = Math.floor(map(hexVal(this.hash, 0), 0, 15, 100, 400));
        const amplitude = Math.floor(map(hexVal(this.hash, 1), 0, 15, 30, 100));
        const waveWidth = Math.floor(map(hexVal(this.hash, 2), 0, 15, 3, 30));
        let fill; let i; let opacity; let str; let styles; let val; let xOffset;

        this.svg.setWidth(period);
        this.svg.setHeight(waveWidth * 36);

        for (i = 0; i < 36; i++) {
            val     = hexVal(this.hash, i);
            opacity = fillOpacity(val);
            fill    = fillColor(val);
            xOffset = period / 4 * 0.7;

            styles = {
                "fill": "none",
                "stroke": fill,
                opacity,
                "stroke-width": "" + waveWidth + "px",
            };

            str = "M0 " + amplitude +
			" C " + xOffset + " 0, " + (period / 2 - xOffset) + " 0, " + (period / 2) + " " + amplitude +
			" S " + (period - xOffset) + " " + (amplitude * 2) + ", " + period + " " + amplitude +
			" S " + (period * 1.5 - xOffset) + " 0, " + (period * 1.5) + ", " + amplitude;

            this.svg.path(str, styles).transform({
                translate: [
                    -period / 4,
                    waveWidth * i - amplitude * 1.5,
                ],
            });
            this.svg.path(str, styles).transform({
                translate: [
                    -period / 4,
                    waveWidth * i - amplitude * 1.5 + waveWidth * 36,
                ],
            });
        }
    };

    public geoChevrons() {
        const chevronWidth  = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        const chevronHeight = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        const chevron       = PatternBuilder.buildChevronShape(chevronWidth, chevronHeight);
        let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(chevronWidth * 6);
        this.svg.setHeight(chevronHeight * 6 * 0.66);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                    fill,
                    "fill-opacity": opacity,
                    "stroke-width": 1,
                };

                this.svg.group(styles).transform({
                    translate: [
                        x * chevronWidth,
                        y * chevronHeight * 0.66 - chevronHeight / 2,
                    ],
                }).polyline(chevron).end();

                // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * chevronWidth,
                            6 * chevronHeight * 0.66 - chevronHeight / 2,
                        ],
                    }).polyline(chevron).end();
                }

                i += 1;
            }
        }
    };

    public geoPlusSigns() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const plusSize   = squareSize * 3;
        const plusShape  = PatternBuilder.buildPlusShape(squareSize);
        let dx; let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(squareSize * 12);
        this.svg.setHeight(squareSize * 12);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);
                dx      = (y % 2 === 0) ? 0 : 1;

                styles = {
                    fill,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                    "fill-opacity": opacity,
                };

                this.svg.group(styles).transform({
                    translate: [
                        x * plusSize - x * squareSize + dx * squareSize - squareSize,
                        y * plusSize - y * squareSize - plusSize / 2,
                    ],
                }).rect(plusShape).end();

                // Add an extra column on the right for tiling.
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            y * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                // Add an extra row on the bottom that matches the first row, for tiling
                if (y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                // Add an extra one at top-right and bottom-right, for tiling
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }

                i++;
            }
        }
    };

    public geoXes() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const xShape     = PatternBuilder.buildPlusShape(squareSize);
        const xSize      = squareSize * 3 * 0.943;
        let dy; let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(xSize * 3);
        this.svg.setHeight(xSize * 3);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                dy      = x % 2 === 0 ? y * xSize - xSize * 0.5 : y * xSize - xSize * 0.5 + xSize / 4;
                fill    = fillColor(val);

                styles = {
                    fill,
                    opacity,
                };

                this.svg.group(styles).transform({
                    translate: [
                        x * xSize / 2 - xSize / 2,
                        dy - y * xSize / 2,
                    ],
                    rotate: [
                        45,
                        xSize / 2,
                        xSize / 2,
                    ],
                }).rect(xShape).end();

                // Add an extra column on the right for tiling.
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            6 * xSize / 2 - xSize / 2,
                            dy - y * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // // Add an extra row on the bottom that matches the first row, for tiling.
                if (y === 0) {
                    dy = x % 2 === 0 ? 6 * xSize - xSize / 2 : 6 * xSize - xSize / 2 + xSize / 4;
                    this.svg.group(styles).transform({
                        translate: [
                            x * xSize / 2 - xSize / 2,
                            dy - 6 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // These can hang off the bottom, so put a row at the top for tiling.
                if (y === 5) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * xSize / 2 - xSize / 2,
                            dy - 11 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }

                // Add an extra one at top-right and bottom-right, for tiling
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            6 * xSize / 2 - xSize / 2,
                            dy - 6 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                i++;
            }
        }
    };

    public geoOverlappingCircles() {
        const scale    = hexVal(this.hash, 0);
        const diameter = map(scale, 0, 15, 25, 200);
        const radius   = diameter / 2;
        let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(radius * 6);
        this.svg.setHeight(radius * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    fill,
                    opacity,
                };

                this.svg.circle(x * radius, y * radius, radius, styles);

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.circle(6 * radius, y * radius, radius, styles);
                }

                // // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    this.svg.circle(x * radius, 6 * radius, radius, styles);
                }

                // // Add an extra one at bottom-right, for tiling.
                if (x === 0 && y === 0) {
                    this.svg.circle(6 * radius, 6 * radius, radius, styles);
                }

                i++;
            }
        }
    }

    public geoOctogons() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);
        const tile       = PatternBuilder.buildOctogonShape(squareSize);
        let fill; let i; let opacity; let val; let x; let y;

        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                this.svg.polyline(tile, {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                }).transform({
                    translate: [
                        x * squareSize,
                        y * squareSize,
                    ],
                });

                i += 1;
            }
        }
    };

    public geoSquares() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);
        let fill; let i; let opacity; let val; let x; let y;

        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                this.svg.rect(x * squareSize, y * squareSize, squareSize, squareSize, {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                });

                i += 1;
            }
        }
    };

    public geoConcentricCircles() {
        const scale       = hexVal(this.hash, 0);
        const ringSize    = map(scale, 0, 15, 10, 60);
        const strokeWidth = ringSize / 5;
        let fill; let i; let opacity; let val; let x; let y;

        this.svg.setWidth((ringSize + strokeWidth) * 6);
        this.svg.setHeight((ringSize + strokeWidth) * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                this.svg.circle(
                    x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
                    y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
                    ringSize / 2,
                    {
                        "fill": "none",
                        "stroke": fill,
                        opacity,
                        "stroke-width": strokeWidth + "px",
                    }
                );

                val     = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                this.svg.circle(
                    x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2,
                    y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2,
                    ringSize / 4,
                    {
                        fill,
                        "fill-opacity": opacity,
                    }
                );

                i += 1;
            }
        }
    };

    public geoOverlappingRings() {
        const scale       = hexVal(this.hash, 0);
        const ringSize    = map(scale, 0, 15, 10, 60);
        const strokeWidth = ringSize / 4;
        let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(ringSize * 6);
        this.svg.setHeight(ringSize * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity,
                    "stroke-width": strokeWidth + "px",
                };

                this.svg.circle(x * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.circle(6 * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);
                }

                if (y === 0) {
                    this.svg.circle(x * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }

                if (x === 0 && y === 0) {
                    this.svg.circle(6 * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }

                i += 1;
            }
        }
    };

    public geoTriangles() {
        const scale          = hexVal(this.hash, 0);
        const sideLength     = map(scale, 0, 15, 15, 80);
        const triangleHeight = sideLength / 2 * Math.sqrt(3);
        const triangle       = PatternBuilder.buildTriangleShape(sideLength, triangleHeight);
        let fill; let i; let opacity; let rotation; let styles; let val; let x; let y;

        this.svg.setWidth(sideLength * 3);
        this.svg.setHeight(triangleHeight * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };

                if (y % 2 === 0) {
                    rotation = x % 2 === 0 ? 180 : 0;
                } else {
                    rotation = x % 2 !== 0 ? 180 : 0;
                }

                this.svg.polyline(triangle, styles).transform({
                    translate: [
                        x * sideLength * 0.5 - sideLength / 2,
                        triangleHeight * y,
                    ],
                    rotate: [
                        rotation,
                        sideLength / 2,
                        triangleHeight / 2,
                    ],
                });

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            6 * sideLength * 0.5 - sideLength / 2,
                            triangleHeight * y,
                        ],
                        rotate: [
                            rotation,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                }

                i += 1;
            }
        }
    };


    public geoDiamonds() {
        const diamondWidth  = map(hexVal(this.hash, 0), 0, 15, 10, 50);
        const diamondHeight = map(hexVal(this.hash, 1), 0, 15, 10, 50);
        const diamond       = PatternBuilder.buildDiamondShape(diamondWidth, diamondHeight);
        let dx; let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth(diamondWidth * 6);
        this.svg.setHeight(diamondHeight * 3);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };

                dx = (y % 2 === 0) ? 0 : diamondWidth / 2;

                this.svg.polyline(diamond, styles).transform({
                    translate: [
                        x * diamondWidth - diamondWidth / 2 + dx,
                        diamondHeight / 2 * y - diamondHeight / 2,
                    ],
                });

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * y - diamondHeight / 2,
                        ],
                    });
                }

                // Add an extra row at the end that matches the first row, for tiling.
                if (y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            x * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * 6 - diamondHeight / 2,
                        ],
                    });
                }

                // Add an extra one at bottom-right, for tiling.
                if (x === 0 && y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * 6 - diamondHeight / 2,
                        ],
                    });
                }

                i += 1;
            }
        }
    };

    public geoNestedSquares() {
        const blockSize  = map(hexVal(this.hash, 0), 0, 15, 4, 12);
        const squareSize = blockSize * 7;
        let fill; let i; let opacity; let styles; let val; let x; let y;

        this.svg.setWidth((squareSize + blockSize) * 6 + blockSize * 6);
        this.svg.setHeight((squareSize + blockSize) * 6 + blockSize * 6);

        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val     = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity,
                    "stroke-width": blockSize + "px",
                };

                this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2,
                    y * squareSize + y * blockSize * 2 + blockSize / 2,
                    squareSize, squareSize, styles);

                val     = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill    = fillColor(val);

                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity,
                    "stroke-width": blockSize + "px",
                };

                this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    y * squareSize + y * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    blockSize * 3, blockSize * 3, styles);

                i += 1;
            }
        }
    };


    public geoMosaicSquares() {
        const triangleSize = map(hexVal(this.hash, 0), 0, 15, 15, 50);
        let i; let x; let y;

        this.svg.setWidth(triangleSize * 8);
        this.svg.setHeight(triangleSize * 8);

        i = 0;
        for (y = 0; y < 4; y++) {
            for (x = 0; x < 4; x++) {
                if (x % 2 === 0) {
                    if (y % 2 === 0) {
                        PatternBuilder.drawOuterMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            hexVal(this.hash, i)
                        );
                    } else {
                        PatternBuilder.drawInnerMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            [hexVal(this.hash, i), hexVal(this.hash, i + 1)]
                        );
                    }
                } else {
                    if (y % 2 === 0) {
                        PatternBuilder.drawInnerMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            [hexVal(this.hash, i), hexVal(this.hash, i + 1)]
                        );
                    } else {
                        PatternBuilder.drawOuterMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            hexVal(this.hash, i)
                        );
                    }
                }

                i += 1;
            }
        }
    };

    public geoPlaid() {
        let height = 0;
        let width  = 0;
        let fill; let i; let opacity; let space; let stripeHeight; let stripeWidth; let val;

        // Horizontal stripes
        i = 0;
        while (i < 36) {
            space   = hexVal(this.hash, i);
            height += space + 5;

            val          = hexVal(this.hash, i + 1);
            opacity      = fillOpacity(val);
            fill         = fillColor(val);
            stripeHeight = val + 5;

            this.svg.rect(0, height, "100%", stripeHeight, {
                opacity,
                fill,
            });

            height += stripeHeight;
            i += 2;
        }

        // Vertical stripes
        i = 0;
        while (i < 36) {
            space  = hexVal(this.hash, i);
            width += space + 5;

            val         = hexVal(this.hash, i + 1);
            opacity     = fillOpacity(val);
            fill        = fillColor(val);
            stripeWidth = val + 5;

            this.svg.rect(width, 0, stripeWidth, "100%", {
                opacity,
                fill,
            });

            width += stripeWidth;
            i += 2;
        }

        this.svg.setWidth(width);
        this.svg.setHeight(height);
    };


    // eslint-disable-next-line complexity
    public geoTessellation() {
        // 3.4.6.4 semi-regular tessellation
        const sideLength     = map(hexVal(this.hash, 0), 0, 15, 5, 40);
        const hexHeight      = sideLength * Math.sqrt(3);
        const hexWidth       = sideLength * 2;
        const triangleHeight = sideLength / 2 * Math.sqrt(3);
        const triangle       = PatternBuilder.buildRotatedTriangleShape(sideLength, triangleHeight);
        const tileWidth      = sideLength * 3 + triangleHeight * 2;
        const tileHeight     = (hexHeight * 2) + (sideLength * 2);
        let fill; let i; let opacity; let styles; let val;

        this.svg.setWidth(tileWidth);
        this.svg.setHeight(tileHeight);

        for (i = 0; i < 20; i++) {
            val     = hexVal(this.hash, i);
            opacity = fillOpacity(val);
            fill    = fillColor(val);

            styles  = {
                "stroke": STROKE_COLOR,
                "stroke-opacity": STROKE_OPACITY,
                fill,
                "fill-opacity": opacity,
                "stroke-width": 1,
            };

            switch (i) {
                case 0: // All 4 corners
                    this.svg.rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(-sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 1: // Center / top square
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight / 2, sideLength, sideLength, styles);
                    break;
                case 2: // Side squares
                    this.svg.rect(-sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 3: // Center / bottom square
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight * 1.5 + sideLength, sideLength, sideLength, styles);
                    break;
                case 4: // Left top / bottom triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight - -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 5: // Right top / bottom triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight + sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 6: // Center / top / right triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            hexHeight / 2,
                        ]});
                    break;
                case 7: // Center / top / left triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            hexHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 8: // Center / bottom / right triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 9: // Center / bottom / left triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 10: // Left / middle triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                    });
                    break;
                case 11: // Right // middle triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 12: // Left / top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 13: // Right / top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [-tileWidth + sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 14: // Left / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 15: // Right / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            tileHeight / 2 - sideLength / 2  - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 16: // Left / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 17: // Right / center-bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 18: // Left / bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 19: // Right / bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
            }
        }
    };

}


class PatternBuilder {
    public static  buildHexagonShape(sideLength: number) {
        const c = sideLength;
        const a = c / 2;
        const b = Math.sin(60 * Math.PI / 180) * c;
        return [
            0, b,
            a, 0,
            a + c, 0,
            2 * c, b,
            a + c, 2 * b,
            a, 2 * b,
            0, b,
        ].join(",");
    }

    public static  buildChevronShape(width: number, height: number) {
        const e = height * 0.66;
        return [
            [
                0, 0,
                width / 2, height - e,
                width / 2, height,
                0, e,
                0, 0,
            ],
            [
                width / 2, height - e,
                width, 0,
                width, e,
                width / 2, height,
                width / 2, height - e,
            ],
        ].map(function(x) {
            return x.join(",");
        });
    }

    public static buildPlusShape(squareSize: number) {
        return [
            [squareSize, 0, squareSize, squareSize * 3],
            [0, squareSize, squareSize * 3, squareSize],
        ];
    }

    public static buildOctogonShape(squareSize: number) {
        const s = squareSize;
        const c = s * 0.33;
        return [
            c, 0,
            s - c, 0,
            s, c,
            s, s - c,
            s - c, s,
            c, s,
            0, s - c,
            0, c,
            c, 0,
        ].join(",");
    }

    public static buildTriangleShape(sideLength: number, height: number) {
        const halfWidth = sideLength / 2;
        return [
            halfWidth, 0,
            sideLength, height,
            0, height,
            halfWidth, 0,
        ].join(",");
    }

    public static buildDiamondShape(width: number, height: number) {
        return [
            width / 2, 0,
            width, height / 2,
            width / 2, height,
            0, height / 2,
        ].join(",");
    }

    public static buildRightTriangleShape(sideLength: number) {
        return [
            0, 0,
            sideLength, sideLength,
            0, sideLength,
            0, 0,
        ].join(",");
    }

    public static drawInnerMosaicTile(svg: SVG, x: number, y: number, triangleSize: number, vals: number[]) {
        const triangle = PatternBuilder.buildRightTriangleShape(triangleSize);
        let opacity  = fillOpacity(vals[0]);
        let fill     = fillColor(vals[0]);
        let styles   = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y,
            ],
            scale: [-1, 1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y + triangleSize * 2,
            ],
            scale: [1, -1],
        });

        opacity = fillOpacity(vals[1]);
        fill    = fillColor(vals[1]);
        styles  = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y + triangleSize * 2,
            ],
            scale: [-1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y,
            ],
            scale: [1, 1],
        });
    }

    public static drawOuterMosaicTile(svg: SVG, x: number, y: number, triangleSize: number, val: number) {
        const opacity  = fillOpacity(val);
        const fill     = fillColor(val);
        const triangle = PatternBuilder.buildRightTriangleShape(triangleSize);
        const styles   = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x,
                y + triangleSize,
            ],
            scale: [1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize * 2,
                y + triangleSize,
            ],
            scale: [-1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x,
                y + triangleSize,
            ],
            scale: [1, 1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize * 2,
                y + triangleSize,
            ],
            scale: [-1, 1],
        });
    }

    public static buildRotatedTriangleShape(sideLength: number, triangleWidth: number) {
        const halfHeight = sideLength / 2;
        return [
            0, 0,
            triangleWidth, halfHeight,
            0, sideLength,
            0, 0,
        ].join(",");
    }
}

