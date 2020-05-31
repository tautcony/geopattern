import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption } from "./util";

export default class NestedSquares extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
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
                    "stroke-width": `${blockSize}px`,
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
                    "stroke-width": `${blockSize}px`,
                };

                this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    y * squareSize + y * blockSize * 2 + blockSize / 2 + blockSize * 2,
                    blockSize * 3, blockSize * 3, styles);

                i += 1;
            }
        }
    }
}
