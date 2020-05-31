"use strict";

import * as assign from "object-assign";
import XMLNode from "./xml";

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
            Object.keys(transformations).map(function(transformation) {
                return transformation + "(" + transformations[transformation].join(",") + ")";
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

        const rect = new XMLNode("rect");
        this.currentContext().appendChild(rect);
        SVG.setAttributes(rect, assign({
            x,
            y,
            width,
            height,
        }, args));

        return this;
    };

    public circle(cx: number, cy: number, r: number, args: Idict) {
        const circle = new XMLNode("circle");
        this.currentContext().appendChild(circle);
        SVG.setAttributes(circle, assign({
            cx,
            cy,
            r,
        }, args));

        return this;
    };

    public path(str: string, args: Idict) {
        const path = new XMLNode("path");
        this.currentContext().appendChild(path);
        SVG.setAttributes(path, assign({
            d: str,
        }, args));

        return this;
    };

    public polyline(str: string | string[], args?: Idict) {
        // Accept array first argument
        if (Array.isArray(str)) {
            str.forEach((s) => {
                this.polyline(s, args);
            });
            return this;
        }

        const polyline = new XMLNode("polyline");
        this.currentContext().appendChild(polyline);
        SVG.setAttributes(polyline, assign({
            points: str,
        }, args));

        return this;
    };

    // group and context are hacks
    public group(args: Idict) {
        const group = new XMLNode("g");
        this.currentContext().appendChild(group);
        this.context.push(group);
        SVG.setAttributes(group, assign({}, args));
        return this;
    };

}
