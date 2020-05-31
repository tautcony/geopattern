export type length = number | string;
export type coordinate = number | string;
export type angle = number | string;
export type percentage = string;

export type ContentType = length | coordinate | angle | percentage;

export interface Idict {
    [key: string]: ContentType;
}
