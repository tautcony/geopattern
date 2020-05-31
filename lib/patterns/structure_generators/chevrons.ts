import Pattern from "../pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "../util";

export default class Chevrons extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    private static  buildChevronShape(width: number, height: number) {
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
        ].map(x => x.join(","));
    }

    public generate() {
        const chevronWidth  = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        const chevronHeight = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        const chevron       = Chevrons.buildChevronShape(chevronWidth, chevronHeight);

        this.svg.setWidth(chevronWidth * 6);
        this.svg.setHeight(chevronHeight * 6 * 0.66);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val     = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill    = fillColor(val);

                const styles = {
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
    }
}
