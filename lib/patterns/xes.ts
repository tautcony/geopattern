import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class Xes extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const xShape     = Xes.buildPlusShape(squareSize);
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
    }
}
