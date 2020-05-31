import * as color from "../color";
import sha1 from "../sha1";
import { IPatternOption, map, hexVal } from "./util";
import SVG from "../svg";

const DEFAULTS = {
    baseColor: "#933c3c",
};

export default abstract class Pattern {
    public color: string;
    protected opts: IPatternOption;
    protected hash: string;
    protected svg: SVG;

    public constructor(str: string, options?: IPatternOption) {
        this.opts = { ...DEFAULTS, ...options };
        this.hash = this.opts.hash || sha1(str);
        this.svg = new SVG();
        this.generateBackground();
    }

    protected static buildPlusShape(squareSize: number): [number, number, number, number][] {
        return [
            [squareSize, 0, squareSize, squareSize * 3],
            [0, squareSize, squareSize * 3, squareSize],
        ];
    }

    public toSvg() {
        return this.svg.toString();
    }

    public toString() {
        return this.toSvg();
    }

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
    }

    public toDataUri() {
        return `data:image/svg+xml;base64,${this.toBase64()}`;
    }

    public toDataUrl() {
        return `url("${this.toDataUri()}")`;
    }

    private generateBackground() {
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

    public abstract generate(): void;
}
