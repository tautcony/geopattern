import sha1 from "./sha1";
import { hexVal, IPatternOption } from "./patterns/util";
import { Pattern, Chevrons, ConcentricCircles, Diamonds, Hexagons, MosaicSquares, NestedSquares, Octogons, OverlappingCircles, OverlappingRings, Plaid, PlusSigns, SineWaves, Squares, Tessellation, Triangles, Xes } from "./patterns";

const PATTERNS = {
    octogons: Octogons,
    overlappingCircles: OverlappingCircles,
    plusSigns: PlusSigns,
    xes: Xes,
    sineWaves: SineWaves,
    hexagons: Hexagons,
    overlappingRings: OverlappingRings,
    plaid: Plaid,
    triangles: Triangles,
    squares: Squares,
    concentricCircles: ConcentricCircles,
    diamonds: Diamonds,
    tessellation: Tessellation,
    nestedSquares: NestedSquares,
    mosaicSquares: MosaicSquares,
    chevrons: Chevrons,
};

export default class PatternGenerator {
    private pattern: Pattern;

    public get Pattern() {
        return this.pattern;
    }

    public constructor(str: string, options?: IPatternOption) {
        options = { ...options };
        options.hash = options.hash || sha1(str);
        let generatorName = options.generator;

        if (generatorName) {
            if (Object.keys(PATTERNS).indexOf(generatorName) < 0) {
                throw new Error(`The generator ${generatorName}  does not exist.`);
            }
        } else {
            generatorName = Object.keys(PATTERNS)[hexVal(options.hash, 20)];
        }

        this.pattern = new PATTERNS[generatorName](str, options);
        this.pattern.generate();
    }
}

export { IPatternOption } from "./patterns/util";
export { Pattern } from "./patterns";
