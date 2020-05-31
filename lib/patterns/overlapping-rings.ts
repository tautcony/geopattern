import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class OverlappingRings extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
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
                    "stroke-width": `${strokeWidth}px`,
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
    }
}
