import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class Hexagons extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    private static buildHexagonShape(sideLength: number) {
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

    public generate() {
        const scale      = hexVal(this.hash, 0);
        const sideLength = map(scale, 0, 15, 8, 60);
        const hexHeight  = sideLength * Math.sqrt(3);
        const hexWidth   = sideLength * 2;
        const hex        = Hexagons.buildHexagonShape(sideLength);
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
    }
}
