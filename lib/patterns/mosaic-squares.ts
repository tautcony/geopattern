import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor, map,IPatternOption, STROKE_COLOR, STROKE_OPACITY } from "./util";
import SVG from "../svg";

export default class MosaicSquares extends Pattern {
    public constructor(str: string, options?: IPatternOption) {
        super(str, options);
    }

    private static buildRightTriangleShape(sideLength: number) {
        return [
            0, 0,
            sideLength, sideLength,
            0, sideLength,
            0, 0,
        ].join(",");
    }

    private static drawOuterMosaicTile(svg: SVG, x: number, y: number, triangleSize: number, val: number) {
        const opacity  = fillOpacity(val);
        const fill     = fillColor(val);
        const triangle = MosaicSquares.buildRightTriangleShape(triangleSize);
        const styles   = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x,
                y + triangleSize,
            ],
            scale: [1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize * 2,
                y + triangleSize,
            ],
            scale: [-1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x,
                y + triangleSize,
            ],
            scale: [1, 1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize * 2,
                y + triangleSize,
            ],
            scale: [-1, 1],
        });
    }

    private static drawInnerMosaicTile(svg: SVG, x: number, y: number, triangleSize: number, vals: number[]) {
        const triangle = MosaicSquares.buildRightTriangleShape(triangleSize);
        let opacity  = fillOpacity(vals[0]);
        let fill     = fillColor(vals[0]);
        let styles   = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y,
            ],
            scale: [-1, 1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y + triangleSize * 2,
            ],
            scale: [1, -1],
        });

        opacity = fillOpacity(vals[1]);
        fill    = fillColor(vals[1]);
        styles  = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill,
        };

        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y + triangleSize * 2,
            ],
            scale: [-1, -1],
        });
        svg.polyline(triangle, styles).transform({
            translate: [
                x + triangleSize,
                y,
            ],
            scale: [1, 1],
        });
    }

    public generate() {
        const triangleSize = map(hexVal(this.hash, 0), 0, 15, 15, 50);
        let i; let x; let y;

        this.svg.setWidth(triangleSize * 8);
        this.svg.setHeight(triangleSize * 8);

        i = 0;
        for (y = 0; y < 4; y++) {
            for (x = 0; x < 4; x++) {
                if (x % 2 === 0) {
                    if (y % 2 === 0) {
                        MosaicSquares.drawOuterMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            hexVal(this.hash, i)
                        );
                    } else {
                        MosaicSquares.drawInnerMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            [hexVal(this.hash, i), hexVal(this.hash, i + 1)]
                        );
                    }
                } else {
                    if (y % 2 === 0) {
                        MosaicSquares.drawInnerMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            [hexVal(this.hash, i), hexVal(this.hash, i + 1)]
                        );
                    } else {
                        MosaicSquares.drawOuterMosaicTile(this.svg,
                            x * triangleSize * 2,
                            y * triangleSize * 2,
                            triangleSize,
                            hexVal(this.hash, i)
                        );
                    }
                }

                i += 1;
            }
        }
    }
}
