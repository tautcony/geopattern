import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class OverlappingCircles extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
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
}
