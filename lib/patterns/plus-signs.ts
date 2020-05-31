import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class PlusSigns extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        const plusSize   = squareSize * 3;
        const plusShape  = PlusSigns.buildPlusShape(squareSize);
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
    }
}
