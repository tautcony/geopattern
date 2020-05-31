import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";

export default class Plaid extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    public generate() {
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
    }
}
