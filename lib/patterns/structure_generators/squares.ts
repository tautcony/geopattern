import Pattern from "../pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "../util";

export default class Squares extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);

        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val     = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill    = fillColor(val);

                this.svg.rect(x * squareSize, y * squareSize, squareSize, squareSize, {
                    fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                });

                i += 1;
            }
        }
    }
}