"use strict";

import XMLNode from "./xmlnode";

interface Idict {
    [key: string]: string | number;
};

export default class SVG {
    private width: number;
    private height: number;
    private svg: XMLNode;
    private context: XMLNode[];
    public constructor() {
        this.width = 100;
        this.height = 100;
        this.svg = new XMLNode("svg");
        this.context = []; // Track nested nodes
        SVG.setAttributes(this.svg, {
            xmlns: "http://www.w3.org/2000/svg",
            width: this.width,
            height: this.height,
        });
    }

    public static setAttributes(el: XMLNode, attrs: Idict) {
        Object.keys(attrs).forEach((attr) => {
            el.setAttribute(attr, attrs[attr]);
        });
    }

    // This is a hack so groups work.
    public currentContext() {
        return this.context[this.context.length - 1] || this.svg;
    }

    // This is a hack so groups work.
    public end() {
        this.context.pop();
        return this;
    }

    public currentNode() {
        const context = this.currentContext();
        return context.lastChild || context;
    }

    public transform(transformations: {[key: string]: number[]}) {
        this.currentNode().setAttribute("transform",
            Object.keys(transformations).map(transformation => {
                const args = transformations[transformation].join(",");
                return `${transformation}(${args})`;
            }).join(" ")
        );
        return this;
    }

    public setWidth(width: number) {
        this.svg.setAttribute("width", Math.floor(width));
    }

    public setHeight(height: number) {
        this.svg.setAttribute("height", Math.floor(height));
    }

    public toString() {
        return this.svg.toString();
    };

    public rect(x: number | number[][], y?: number|string, width?: number|string, height?: number|string, args?: Idict) {
        // Accept array first argument
        if (Array.isArray(x)) {
            x.forEach((a) => {
                this.rect.apply(this, [].concat(a).concat(args));
            });
            return this;
        }

        const rect = this.newChild("rect");
        SVG.setAttributes(rect, { x, y, width, height, ...args });

        return this;
    };

    public circle(cx: number, cy: number, r: number, args: Idict) {
        const circle = new XMLNode("circle");
        this.currentContext().appendChild(circle);
        SVG.setAttributes(circle, { cx, cy, r, ...args });

        return this;
    };

    public path(str: string, args: Idict) {
        const path = this.newChild("path");
        SVG.setAttributes(path, { d: str, ...args });
        return this;
    };

    public polyline(str: string | string[], args?: Idict) {
        // Accept array first argument
        if (Array.isArray(str)) {
            str.forEach((s) => {
                this.polyline(s, args);
            });
            return this;
        } else {
            const polyline = this.newChild("polyline");
            SVG.setAttributes(polyline, { points: str, ...args });
        }

        return this;
    };

    // group and context are hacks
    public group(args: Idict) {
        const group = this.newChild("g");
        this.context.push(group);
        SVG.setAttributes(group, { ...args });
        return this;
    };

    private newChild(type: string) {
        const child = new XMLNode(type);
        this.currentContext().appendChild(child);
        return child;
    }
}
