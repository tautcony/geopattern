export type length = number | string;
export type coordinate = number | string;
export type angle = number | string;
export type percentage = string;

export type ContentType = length | coordinate | angle | percentage;

export const AvailableStructure = ["octogons", "overlappingCircles", "plusSigns", "xes", "sineWaves", "hexagons", "overlappingRings", "plaid", "triangles", "squares", "concentricCircles", "diamonds", "tessellation", "nestedSquares", "mosaicSquares", "chevrons"] as const;

export type AvailableStructureType = typeof AvailableStructure[number];

export interface Idict {
    [key: string]: ContentType;
}

export interface IPatternOption {
    hash?: string;
    color?: string;
    baseColor?: string;
    generator?: AvailableStructureType;
}
