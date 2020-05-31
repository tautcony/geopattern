(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GeoPattern = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgb2rgbString = exports.hsl2rgb = exports.rgb2hsl = exports.rgb2hex = exports.hex2rgb = void 0;
;
function hex2rgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) { return r + r + g + g + b + b; });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}
exports.hex2rgb = hex2rgb;
function rgb2hex(rgb) {
    return "#" + ["r", "g", "b"].map(function (key) { return ("0" + rgb[key].toString(16)).slice(-2); }).join("");
}
exports.rgb2hex = rgb2hex;
function rgb2hsl(rgb) {
    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h;
    var s;
    var l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return { h: h, s: s, l: l };
}
exports.rgb2hsl = rgb2hsl;
function hsl2rgb(hsl) {
    function hue2rgb(p, q, t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    var h = hsl.h;
    var s = hsl.s;
    var l = hsl.l;
    var r;
    var g;
    var b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}
exports.hsl2rgb = hsl2rgb;
function rgb2rgbString(rgb) {
    return "rgb(" + [rgb.r, rgb.g, rgb.b].join(",") + ")";
}
exports.rgb2rgbString = rgb2rgbString;

},{}],2:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assign = require("object-assign");
var color = require("./color");
var sha1_1 = require("./sha1");
var svg_1 = require("./svg");
var DEFAULTS = {
    baseColor: "#933c3c",
};
var PATTERNS = [
    "octogons",
    "overlappingCircles",
    "plusSigns",
    "xes",
    "sineWaves",
    "hexagons",
    "overlappingRings",
    "plaid",
    "triangles",
    "squares",
    "concentricCircles",
    "diamonds",
    "tessellation",
    "nestedSquares",
    "mosaicSquares",
    "chevrons",
];
var FILL_COLOR_DARK = "#222";
var FILL_COLOR_LIGHT = "#ddd";
var STROKE_COLOR = "#000";
var STROKE_OPACITY = 0.02;
var OPACITY_MIN = 0.02;
var OPACITY_MAX = 0.15;
function hexVal(hash, index, len) {
    return parseInt(hash.substr(index, len || 1), 16);
}
function map(value, vMin, vMax, dMin, dMax) {
    var vValue = typeof value === "number" ? value : parseFloat(value);
    var vRange = vMax - vMin;
    var dRange = dMax - dMin;
    return (vValue - vMin) * dRange / vRange + dMin;
}
function fillColor(val) {
    return (val % 2 === 0) ? FILL_COLOR_LIGHT : FILL_COLOR_DARK;
}
function fillOpacity(val) {
    return map(val, 0, 15, OPACITY_MIN, OPACITY_MAX);
}
var Pattern = (function () {
    function Pattern(str, options) {
        this.opts = assign({}, DEFAULTS, options);
        this.hash = this.opts.hash || sha1_1.default(str);
        this.svg = new svg_1.default();
        this.generateBackground();
        this.generatePattern();
    }
    Pattern.prototype.toSvg = function () {
        return this.svg.toString();
    };
    ;
    Pattern.prototype.toString = function () {
        return this.toSvg();
    };
    ;
    Pattern.prototype.toBase64 = function () {
        var str = this.toSvg();
        var b64;
        if (typeof window !== "undefined" && typeof window.btoa === "function") {
            b64 = window.btoa(str);
        }
        else {
            b64 = new Buffer(str).toString("base64");
        }
        return b64;
    };
    ;
    Pattern.prototype.toDataUri = function () {
        return "data:image/svg+xml;base64," + this.toBase64();
    };
    ;
    Pattern.prototype.toDataUrl = function () {
        return 'url("' + this.toDataUri() + '")';
    };
    ;
    Pattern.prototype.generateBackground = function () {
        var baseColor;
        var hueOffset;
        var rgb;
        var satOffset;
        if (this.opts.color) {
            rgb = color.hex2rgb(this.opts.color);
        }
        else {
            hueOffset = map(hexVal(this.hash, 14, 3), 0, 4095, 0, 359);
            satOffset = hexVal(this.hash, 17);
            baseColor = color.rgb2hsl(color.hex2rgb(this.opts.baseColor));
            baseColor.h = (((baseColor.h * 360 - hueOffset) + 360) % 360) / 360;
            if (satOffset % 2 === 0) {
                baseColor.s = Math.min(1, ((baseColor.s * 100) + satOffset) / 100);
            }
            else {
                baseColor.s = Math.max(0, ((baseColor.s * 100) - satOffset) / 100);
            }
            rgb = color.hsl2rgb(baseColor);
        }
        this.color = color.rgb2hex(rgb);
        this.svg.rect(0, 0, "100%", "100%", {
            fill: color.rgb2rgbString(rgb),
        });
    };
    ;
    Pattern.prototype.generatePattern = function () {
        var generator = this.opts.generator;
        if (generator) {
            if (PATTERNS.indexOf(generator) < 0) {
                throw new Error("The generator "
                    + generator
                    + " does not exist.");
            }
        }
        else {
            generator = PATTERNS[hexVal(this.hash, 20)];
        }
        return this["geo" + generator.slice(0, 1).toUpperCase() + generator.slice(1)]();
    };
    ;
    Pattern.prototype.geoHexagons = function () {
        var scale = hexVal(this.hash, 0);
        var sideLength = map(scale, 0, 15, 8, 60);
        var hexHeight = sideLength * Math.sqrt(3);
        var hexWidth = sideLength * 2;
        var hex = PatternBuilder.buildHexagonShape(sideLength);
        var dy;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(hexWidth * 3 + sideLength * 3);
        this.svg.setHeight(hexHeight * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                dy = x % 2 === 0 ? y * hexHeight : y * hexHeight + hexHeight / 2;
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };
                this.svg.polyline(hex, styles).transform({
                    translate: [
                        x * sideLength * 1.5 - hexWidth / 2,
                        dy - hexHeight / 2,
                    ],
                });
                if (x === 0) {
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            6 * sideLength * 1.5 - hexWidth / 2,
                            dy - hexHeight / 2,
                        ],
                    });
                }
                if (y === 0) {
                    dy = x % 2 === 0 ? 6 * hexHeight : 6 * hexHeight + hexHeight / 2;
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            x * sideLength * 1.5 - hexWidth / 2,
                            dy - hexHeight / 2,
                        ],
                    });
                }
                if (x === 0 && y === 0) {
                    this.svg.polyline(hex, styles).transform({
                        translate: [
                            6 * sideLength * 1.5 - hexWidth / 2,
                            5 * hexHeight + hexHeight / 2,
                        ],
                    });
                }
                i++;
            }
        }
    };
    ;
    Pattern.prototype.geoSineWaves = function () {
        var period = Math.floor(map(hexVal(this.hash, 0), 0, 15, 100, 400));
        var amplitude = Math.floor(map(hexVal(this.hash, 1), 0, 15, 30, 100));
        var waveWidth = Math.floor(map(hexVal(this.hash, 2), 0, 15, 3, 30));
        var fill;
        var i;
        var opacity;
        var str;
        var styles;
        var val;
        var xOffset;
        this.svg.setWidth(period);
        this.svg.setHeight(waveWidth * 36);
        for (i = 0; i < 36; i++) {
            val = hexVal(this.hash, i);
            opacity = fillOpacity(val);
            fill = fillColor(val);
            xOffset = period / 4 * 0.7;
            styles = {
                "fill": "none",
                "stroke": fill,
                opacity: opacity,
                "stroke-width": "" + waveWidth + "px",
            };
            str = "M0 " + amplitude +
                " C " + xOffset + " 0, " + (period / 2 - xOffset) + " 0, " + (period / 2) + " " + amplitude +
                " S " + (period - xOffset) + " " + (amplitude * 2) + ", " + period + " " + amplitude +
                " S " + (period * 1.5 - xOffset) + " 0, " + (period * 1.5) + ", " + amplitude;
            this.svg.path(str, styles).transform({
                translate: [
                    -period / 4,
                    waveWidth * i - amplitude * 1.5,
                ],
            });
            this.svg.path(str, styles).transform({
                translate: [
                    -period / 4,
                    waveWidth * i - amplitude * 1.5 + waveWidth * 36,
                ],
            });
        }
    };
    ;
    Pattern.prototype.geoChevrons = function () {
        var chevronWidth = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        var chevronHeight = map(hexVal(this.hash, 0), 0, 15, 30, 80);
        var chevron = PatternBuilder.buildChevronShape(chevronWidth, chevronHeight);
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(chevronWidth * 6);
        this.svg.setHeight(chevronHeight * 6 * 0.66);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke-width": 1,
                };
                this.svg.group(styles).transform({
                    translate: [
                        x * chevronWidth,
                        y * chevronHeight * 0.66 - chevronHeight / 2,
                    ],
                }).polyline(chevron).end();
                if (y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * chevronWidth,
                            6 * chevronHeight * 0.66 - chevronHeight / 2,
                        ],
                    }).polyline(chevron).end();
                }
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoPlusSigns = function () {
        var squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        var plusSize = squareSize * 3;
        var plusShape = PatternBuilder.buildPlusShape(squareSize);
        var dx;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(squareSize * 12);
        this.svg.setHeight(squareSize * 12);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                dx = (y % 2 === 0) ? 0 : 1;
                styles = {
                    fill: fill,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                    "fill-opacity": opacity,
                };
                this.svg.group(styles).transform({
                    translate: [
                        x * plusSize - x * squareSize + dx * squareSize - squareSize,
                        y * plusSize - y * squareSize - plusSize / 2,
                    ],
                }).rect(plusShape).end();
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            y * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }
                if (y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            4 * plusSize - x * squareSize + dx * squareSize - squareSize,
                            4 * plusSize - y * squareSize - plusSize / 2,
                        ],
                    }).rect(plusShape).end();
                }
                i++;
            }
        }
    };
    ;
    Pattern.prototype.geoXes = function () {
        var squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 25);
        var xShape = PatternBuilder.buildPlusShape(squareSize);
        var xSize = squareSize * 3 * 0.943;
        var dy;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(xSize * 3);
        this.svg.setHeight(xSize * 3);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                dy = x % 2 === 0 ? y * xSize - xSize * 0.5 : y * xSize - xSize * 0.5 + xSize / 4;
                fill = fillColor(val);
                styles = {
                    fill: fill,
                    opacity: opacity,
                };
                this.svg.group(styles).transform({
                    translate: [
                        x * xSize / 2 - xSize / 2,
                        dy - y * xSize / 2,
                    ],
                    rotate: [
                        45,
                        xSize / 2,
                        xSize / 2,
                    ],
                }).rect(xShape).end();
                if (x === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            6 * xSize / 2 - xSize / 2,
                            dy - y * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                if (y === 0) {
                    dy = x % 2 === 0 ? 6 * xSize - xSize / 2 : 6 * xSize - xSize / 2 + xSize / 4;
                    this.svg.group(styles).transform({
                        translate: [
                            x * xSize / 2 - xSize / 2,
                            dy - 6 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                if (y === 5) {
                    this.svg.group(styles).transform({
                        translate: [
                            x * xSize / 2 - xSize / 2,
                            dy - 11 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                if (x === 0 && y === 0) {
                    this.svg.group(styles).transform({
                        translate: [
                            6 * xSize / 2 - xSize / 2,
                            dy - 6 * xSize / 2,
                        ],
                        rotate: [
                            45,
                            xSize / 2,
                            xSize / 2,
                        ],
                    }).rect(xShape).end();
                }
                i++;
            }
        }
    };
    ;
    Pattern.prototype.geoOverlappingCircles = function () {
        var scale = hexVal(this.hash, 0);
        var diameter = map(scale, 0, 15, 25, 200);
        var radius = diameter / 2;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(radius * 6);
        this.svg.setHeight(radius * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    fill: fill,
                    opacity: opacity,
                };
                this.svg.circle(x * radius, y * radius, radius, styles);
                if (x === 0) {
                    this.svg.circle(6 * radius, y * radius, radius, styles);
                }
                if (y === 0) {
                    this.svg.circle(x * radius, 6 * radius, radius, styles);
                }
                if (x === 0 && y === 0) {
                    this.svg.circle(6 * radius, 6 * radius, radius, styles);
                }
                i++;
            }
        }
    };
    Pattern.prototype.geoOctogons = function () {
        var squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);
        var tile = PatternBuilder.buildOctogonShape(squareSize);
        var fill;
        var i;
        var opacity;
        var val;
        var x;
        var y;
        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                this.svg.polyline(tile, {
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                }).transform({
                    translate: [
                        x * squareSize,
                        y * squareSize,
                    ],
                });
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoSquares = function () {
        var squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);
        var fill;
        var i;
        var opacity;
        var val;
        var x;
        var y;
        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                this.svg.rect(x * squareSize, y * squareSize, squareSize, squareSize, {
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                });
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoConcentricCircles = function () {
        var scale = hexVal(this.hash, 0);
        var ringSize = map(scale, 0, 15, 10, 60);
        var strokeWidth = ringSize / 5;
        var fill;
        var i;
        var opacity;
        var val;
        var x;
        var y;
        this.svg.setWidth((ringSize + strokeWidth) * 6);
        this.svg.setHeight((ringSize + strokeWidth) * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                this.svg.circle(x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2, y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2, ringSize / 2, {
                    "fill": "none",
                    "stroke": fill,
                    opacity: opacity,
                    "stroke-width": strokeWidth + "px",
                });
                val = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                this.svg.circle(x * ringSize + x * strokeWidth + (ringSize + strokeWidth) / 2, y * ringSize + y * strokeWidth + (ringSize + strokeWidth) / 2, ringSize / 4, {
                    fill: fill,
                    "fill-opacity": opacity,
                });
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoOverlappingRings = function () {
        var scale = hexVal(this.hash, 0);
        var ringSize = map(scale, 0, 15, 10, 60);
        var strokeWidth = ringSize / 4;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(ringSize * 6);
        this.svg.setHeight(ringSize * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity: opacity,
                    "stroke-width": strokeWidth + "px",
                };
                this.svg.circle(x * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);
                if (x === 0) {
                    this.svg.circle(6 * ringSize, y * ringSize, ringSize - strokeWidth / 2, styles);
                }
                if (y === 0) {
                    this.svg.circle(x * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }
                if (x === 0 && y === 0) {
                    this.svg.circle(6 * ringSize, 6 * ringSize, ringSize - strokeWidth / 2, styles);
                }
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoTriangles = function () {
        var scale = hexVal(this.hash, 0);
        var sideLength = map(scale, 0, 15, 15, 80);
        var triangleHeight = sideLength / 2 * Math.sqrt(3);
        var triangle = PatternBuilder.buildTriangleShape(sideLength, triangleHeight);
        var fill;
        var i;
        var opacity;
        var rotation;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(sideLength * 3);
        this.svg.setHeight(triangleHeight * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };
                if (y % 2 === 0) {
                    rotation = x % 2 === 0 ? 180 : 0;
                }
                else {
                    rotation = x % 2 !== 0 ? 180 : 0;
                }
                this.svg.polyline(triangle, styles).transform({
                    translate: [
                        x * sideLength * 0.5 - sideLength / 2,
                        triangleHeight * y,
                    ],
                    rotate: [
                        rotation,
                        sideLength / 2,
                        triangleHeight / 2,
                    ],
                });
                if (x === 0) {
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            6 * sideLength * 0.5 - sideLength / 2,
                            triangleHeight * y,
                        ],
                        rotate: [
                            rotation,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                }
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoDiamonds = function () {
        var diamondWidth = map(hexVal(this.hash, 0), 0, 15, 10, 50);
        var diamondHeight = map(hexVal(this.hash, 1), 0, 15, 10, 50);
        var diamond = PatternBuilder.buildDiamondShape(diamondWidth, diamondHeight);
        var dx;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth(diamondWidth * 6);
        this.svg.setHeight(diamondHeight * 3);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    fill: fill,
                    "fill-opacity": opacity,
                    "stroke": STROKE_COLOR,
                    "stroke-opacity": STROKE_OPACITY,
                };
                dx = (y % 2 === 0) ? 0 : diamondWidth / 2;
                this.svg.polyline(diamond, styles).transform({
                    translate: [
                        x * diamondWidth - diamondWidth / 2 + dx,
                        diamondHeight / 2 * y - diamondHeight / 2,
                    ],
                });
                if (x === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * y - diamondHeight / 2,
                        ],
                    });
                }
                if (y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            x * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * 6 - diamondHeight / 2,
                        ],
                    });
                }
                if (x === 0 && y === 0) {
                    this.svg.polyline(diamond, styles).transform({
                        translate: [
                            6 * diamondWidth - diamondWidth / 2 + dx,
                            diamondHeight / 2 * 6 - diamondHeight / 2,
                        ],
                    });
                }
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoNestedSquares = function () {
        var blockSize = map(hexVal(this.hash, 0), 0, 15, 4, 12);
        var squareSize = blockSize * 7;
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        var x;
        var y;
        this.svg.setWidth((squareSize + blockSize) * 6 + blockSize * 6);
        this.svg.setHeight((squareSize + blockSize) * 6 + blockSize * 6);
        i = 0;
        for (y = 0; y < 6; y++) {
            for (x = 0; x < 6; x++) {
                val = hexVal(this.hash, i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity: opacity,
                    "stroke-width": blockSize + "px",
                };
                this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2, y * squareSize + y * blockSize * 2 + blockSize / 2, squareSize, squareSize, styles);
                val = hexVal(this.hash, 39 - i);
                opacity = fillOpacity(val);
                fill = fillColor(val);
                styles = {
                    "fill": "none",
                    "stroke": fill,
                    opacity: opacity,
                    "stroke-width": blockSize + "px",
                };
                this.svg.rect(x * squareSize + x * blockSize * 2 + blockSize / 2 + blockSize * 2, y * squareSize + y * blockSize * 2 + blockSize / 2 + blockSize * 2, blockSize * 3, blockSize * 3, styles);
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoMosaicSquares = function () {
        var triangleSize = map(hexVal(this.hash, 0), 0, 15, 15, 50);
        var i;
        var x;
        var y;
        this.svg.setWidth(triangleSize * 8);
        this.svg.setHeight(triangleSize * 8);
        i = 0;
        for (y = 0; y < 4; y++) {
            for (x = 0; x < 4; x++) {
                if (x % 2 === 0) {
                    if (y % 2 === 0) {
                        PatternBuilder.drawOuterMosaicTile(this.svg, x * triangleSize * 2, y * triangleSize * 2, triangleSize, hexVal(this.hash, i));
                    }
                    else {
                        PatternBuilder.drawInnerMosaicTile(this.svg, x * triangleSize * 2, y * triangleSize * 2, triangleSize, [hexVal(this.hash, i), hexVal(this.hash, i + 1)]);
                    }
                }
                else {
                    if (y % 2 === 0) {
                        PatternBuilder.drawInnerMosaicTile(this.svg, x * triangleSize * 2, y * triangleSize * 2, triangleSize, [hexVal(this.hash, i), hexVal(this.hash, i + 1)]);
                    }
                    else {
                        PatternBuilder.drawOuterMosaicTile(this.svg, x * triangleSize * 2, y * triangleSize * 2, triangleSize, hexVal(this.hash, i));
                    }
                }
                i += 1;
            }
        }
    };
    ;
    Pattern.prototype.geoPlaid = function () {
        var height = 0;
        var width = 0;
        var fill;
        var i;
        var opacity;
        var space;
        var stripeHeight;
        var stripeWidth;
        var val;
        i = 0;
        while (i < 36) {
            space = hexVal(this.hash, i);
            height += space + 5;
            val = hexVal(this.hash, i + 1);
            opacity = fillOpacity(val);
            fill = fillColor(val);
            stripeHeight = val + 5;
            this.svg.rect(0, height, "100%", stripeHeight, {
                opacity: opacity,
                fill: fill,
            });
            height += stripeHeight;
            i += 2;
        }
        i = 0;
        while (i < 36) {
            space = hexVal(this.hash, i);
            width += space + 5;
            val = hexVal(this.hash, i + 1);
            opacity = fillOpacity(val);
            fill = fillColor(val);
            stripeWidth = val + 5;
            this.svg.rect(width, 0, stripeWidth, "100%", {
                opacity: opacity,
                fill: fill,
            });
            width += stripeWidth;
            i += 2;
        }
        this.svg.setWidth(width);
        this.svg.setHeight(height);
    };
    ;
    Pattern.prototype.geoTessellation = function () {
        var sideLength = map(hexVal(this.hash, 0), 0, 15, 5, 40);
        var hexHeight = sideLength * Math.sqrt(3);
        var hexWidth = sideLength * 2;
        var triangleHeight = sideLength / 2 * Math.sqrt(3);
        var triangle = PatternBuilder.buildRotatedTriangleShape(sideLength, triangleHeight);
        var tileWidth = sideLength * 3 + triangleHeight * 2;
        var tileHeight = (hexHeight * 2) + (sideLength * 2);
        var fill;
        var i;
        var opacity;
        var styles;
        var val;
        this.svg.setWidth(tileWidth);
        this.svg.setHeight(tileHeight);
        for (i = 0; i < 20; i++) {
            val = hexVal(this.hash, i);
            opacity = fillOpacity(val);
            fill = fillColor(val);
            styles = {
                "stroke": STROKE_COLOR,
                "stroke-opacity": STROKE_OPACITY,
                fill: fill,
                "fill-opacity": opacity,
                "stroke-width": 1,
            };
            switch (i) {
                case 0:
                    this.svg.rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(-sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 1:
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight / 2, sideLength, sideLength, styles);
                    break;
                case 2:
                    this.svg.rect(-sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 3:
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight * 1.5 + sideLength, sideLength, sideLength, styles);
                    break;
                case 4:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight - -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 5:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight + sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 6:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            hexHeight / 2,
                        ]
                    });
                    break;
                case 7:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            hexHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 8:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 9:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 10:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                    });
                    break;
                case 11:
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 12:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 13:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [-tileWidth + sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 14:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 15:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 16:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 17:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 18:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 19:
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
            }
        }
    };
    ;
    return Pattern;
}());
exports.default = Pattern;
var PatternBuilder = (function () {
    function PatternBuilder() {
    }
    PatternBuilder.buildHexagonShape = function (sideLength) {
        var c = sideLength;
        var a = c / 2;
        var b = Math.sin(60 * Math.PI / 180) * c;
        return [
            0, b,
            a, 0,
            a + c, 0,
            2 * c, b,
            a + c, 2 * b,
            a, 2 * b,
            0, b,
        ].join(",");
    };
    PatternBuilder.buildChevronShape = function (width, height) {
        var e = height * 0.66;
        return [
            [
                0, 0,
                width / 2, height - e,
                width / 2, height,
                0, e,
                0, 0,
            ],
            [
                width / 2, height - e,
                width, 0,
                width, e,
                width / 2, height,
                width / 2, height - e,
            ],
        ].map(function (x) {
            return x.join(",");
        });
    };
    PatternBuilder.buildPlusShape = function (squareSize) {
        return [
            [squareSize, 0, squareSize, squareSize * 3],
            [0, squareSize, squareSize * 3, squareSize],
        ];
    };
    PatternBuilder.buildOctogonShape = function (squareSize) {
        var s = squareSize;
        var c = s * 0.33;
        return [
            c, 0,
            s - c, 0,
            s, c,
            s, s - c,
            s - c, s,
            c, s,
            0, s - c,
            0, c,
            c, 0,
        ].join(",");
    };
    PatternBuilder.buildTriangleShape = function (sideLength, height) {
        var halfWidth = sideLength / 2;
        return [
            halfWidth, 0,
            sideLength, height,
            0, height,
            halfWidth, 0,
        ].join(",");
    };
    PatternBuilder.buildDiamondShape = function (width, height) {
        return [
            width / 2, 0,
            width, height / 2,
            width / 2, height,
            0, height / 2,
        ].join(",");
    };
    PatternBuilder.buildRightTriangleShape = function (sideLength) {
        return [
            0, 0,
            sideLength, sideLength,
            0, sideLength,
            0, 0,
        ].join(",");
    };
    PatternBuilder.drawInnerMosaicTile = function (svg, x, y, triangleSize, vals) {
        var triangle = PatternBuilder.buildRightTriangleShape(triangleSize);
        var opacity = fillOpacity(vals[0]);
        var fill = fillColor(vals[0]);
        var styles = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill: fill,
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
        fill = fillColor(vals[1]);
        styles = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill: fill,
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
    };
    PatternBuilder.drawOuterMosaicTile = function (svg, x, y, triangleSize, val) {
        var opacity = fillOpacity(val);
        var fill = fillColor(val);
        var triangle = PatternBuilder.buildRightTriangleShape(triangleSize);
        var styles = {
            "stroke": STROKE_COLOR,
            "stroke-opacity": STROKE_OPACITY,
            "fill-opacity": opacity,
            fill: fill,
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
    };
    PatternBuilder.buildRotatedTriangleShape = function (sideLength, triangleWidth) {
        var halfHeight = sideLength / 2;
        return [
            0, 0,
            triangleWidth, halfHeight,
            0, sideLength,
            0, 0,
        ].join(",");
    };
    return PatternBuilder;
}());

}).call(this,require("buffer").Buffer)
},{"./color":1,"./sha1":3,"./svg":4,"buffer":6,"object-assign":7}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function create() {
    var h0 = 0x67452301;
    var h1 = 0xEFCDAB89;
    var h2 = 0x98BADCFE;
    var h3 = 0x10325476;
    var h4 = 0xC3D2E1F0;
    var block = new Uint32Array(80);
    var offset = 0;
    var shift = 24;
    var totalLength = 0;
    function processBlock() {
        for (var i = 16; i < 80; i++) {
            var w = block[i - 3] ^ block[i - 8] ^ block[i - 14] ^ block[i - 16];
            block[i] = (w << 1) | (w >>> 31);
        }
        var a = h0;
        var b = h1;
        var c = h2;
        var d = h3;
        var e = h4;
        var f;
        var k;
        for (var i = 0; i < 80; i++) {
            if (i < 20) {
                f = d ^ (b & (c ^ d));
                k = 0x5A827999;
            }
            else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (i < 60) {
                f = (b & c) | (d & (b | c));
                k = 0x8F1BBCDC;
            }
            else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            var temp = (a << 5 | a >>> 27) + f + e + k + (block[i] | 0);
            e = d;
            d = c;
            c = (b << 30 | b >>> 2);
            b = a;
            a = temp;
        }
        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0;
        offset = 0;
        for (var i = 0; i < 16; i++) {
            block[i] = 0;
        }
    }
    function write(byte) {
        block[offset] |= (byte & 0xff) << shift;
        if (shift) {
            shift -= 8;
        }
        else {
            offset++;
            shift = 24;
        }
        if (offset === 16) {
            processBlock();
        }
    }
    function updateString(str) {
        var length = str.length;
        totalLength += length * 8;
        for (var i = 0; i < length; i++) {
            write(str.charCodeAt(i));
        }
    }
    function update(chunk) {
        if (typeof chunk === "string") {
            return updateString(chunk);
        }
        var length = chunk.length;
        totalLength += length * 8;
        for (var i = 0; i < length; i++) {
            write(chunk[i]);
        }
    }
    function toHex(word) {
        var hex = "";
        for (var i = 28; i >= 0; i -= 4) {
            hex += ((word >> i) & 0xf).toString(16);
        }
        return hex;
    }
    function digest() {
        write(0x80);
        if (offset > 14 || (offset === 14 && shift < 24)) {
            processBlock();
        }
        offset = 14;
        shift = 24;
        write(0x00);
        write(0x00);
        write(totalLength > 0xffffffffff ? totalLength / 0x10000000000 : 0x00);
        write(totalLength > 0xffffffff ? totalLength / 0x100000000 : 0x00);
        for (var s = 24; s >= 0; s -= 8) {
            write(totalLength >> s);
        }
        return toHex(h0) +
            toHex(h1) +
            toHex(h2) +
            toHex(h3) +
            toHex(h4);
    }
    return { update: update, digest: digest };
}
function sha1(buffer) {
    var shasum = create();
    shasum.update(buffer);
    return shasum.digest();
}
exports.default = sha1;
;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assign = require("object-assign");
var xml_1 = require("./xml");
;
var SVG = (function () {
    function SVG() {
        this.width = 100;
        this.height = 100;
        this.svg = new xml_1.default("svg");
        this.context = [];
        SVG.setAttributes(this.svg, {
            xmlns: "http://www.w3.org/2000/svg",
            width: this.width,
            height: this.height,
        });
    }
    SVG.setAttributes = function (el, attrs) {
        Object.keys(attrs).forEach(function (attr) {
            el.setAttribute(attr, attrs[attr]);
        });
    };
    SVG.prototype.currentContext = function () {
        return this.context[this.context.length - 1] || this.svg;
    };
    SVG.prototype.end = function () {
        this.context.pop();
        return this;
    };
    SVG.prototype.currentNode = function () {
        var context = this.currentContext();
        return context.lastChild || context;
    };
    SVG.prototype.transform = function (transformations) {
        this.currentNode().setAttribute("transform", Object.keys(transformations).map(function (transformation) {
            return transformation + "(" + transformations[transformation].join(",") + ")";
        }).join(" "));
        return this;
    };
    SVG.prototype.setWidth = function (width) {
        this.svg.setAttribute("width", Math.floor(width));
    };
    SVG.prototype.setHeight = function (height) {
        this.svg.setAttribute("height", Math.floor(height));
    };
    SVG.prototype.toString = function () {
        return this.svg.toString();
    };
    ;
    SVG.prototype.rect = function (x, y, width, height, args) {
        var _this = this;
        if (Array.isArray(x)) {
            x.forEach(function (a) {
                _this.rect.apply(_this, [].concat(a).concat(args));
            });
            return this;
        }
        var rect = new xml_1.default("rect");
        this.currentContext().appendChild(rect);
        SVG.setAttributes(rect, assign({
            x: x,
            y: y,
            width: width,
            height: height,
        }, args));
        return this;
    };
    ;
    SVG.prototype.circle = function (cx, cy, r, args) {
        var circle = new xml_1.default("circle");
        this.currentContext().appendChild(circle);
        SVG.setAttributes(circle, assign({
            cx: cx,
            cy: cy,
            r: r,
        }, args));
        return this;
    };
    ;
    SVG.prototype.path = function (str, args) {
        var path = new xml_1.default("path");
        this.currentContext().appendChild(path);
        SVG.setAttributes(path, assign({
            d: str,
        }, args));
        return this;
    };
    ;
    SVG.prototype.polyline = function (str, args) {
        var _this = this;
        if (Array.isArray(str)) {
            str.forEach(function (s) {
                _this.polyline(s, args);
            });
            return this;
        }
        var polyline = new xml_1.default("polyline");
        this.currentContext().appendChild(polyline);
        SVG.setAttributes(polyline, assign({
            points: str,
        }, args));
        return this;
    };
    ;
    SVG.prototype.group = function (args) {
        var group = new xml_1.default("g");
        this.currentContext().appendChild(group);
        this.context.push(group);
        SVG.setAttributes(group, assign({}, args));
        return this;
    };
    ;
    return SVG;
}());
exports.default = SVG;

},{"./xml":5,"object-assign":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XMLNode = (function () {
    function XMLNode(tagName) {
        this.tagName = tagName;
        this.attributes = Object.create(null);
        this.children = [];
        this.lastChild = null;
    }
    XMLNode.prototype.appendChild = function (child) {
        this.children.push(child);
        this.lastChild = child;
    };
    XMLNode.prototype.setAttribute = function (name, value) {
        this.attributes[name] = value;
    };
    XMLNode.prototype.toString = function () {
        var _this = this;
        return [
            "<",
            this.tagName,
            Object.keys(this.attributes).map(function (attr) { return [
                " ",
                attr,
                "=\"",
                _this.attributes[attr],
                "\"",
            ].join(""); }).join(""),
            ">",
            this.children.map(function (child) { return child.toString(); }).join(""),
            "</",
            this.tagName,
            ">",
        ].join("");
    };
    return XMLNode;
}());
exports.default = XMLNode;

},{}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pattern_1 = require("./pattern");
function optArgs(cb) {
    return function (str, options) {
        if (typeof str === "object") {
            options = str;
            str = null;
        }
        if (str === null || str === undefined) {
            str = (new Date()).toString();
        }
        if (!options) {
            options = {};
        }
        return cb.call(this, str, options);
    };
}
var GeoPattern = {
    generate: optArgs(function (str, options) {
        return new pattern_1.default(str, options);
    }),
};
exports.default = GeoPattern;
(function ($) {
    if ($) {
        $.fn.geopattern = optArgs(function (str, options) {
            return this.each(function () {
                var titleSha = $(this).attr("data-title-sha");
                if (titleSha) {
                    options = $.extend({
                        hash: titleSha,
                    }, options);
                }
                var pattern = GeoPattern.generate(str, options);
                $(this).css("background-image", pattern.toDataUrl());
            });
        });
    }
}(typeof jQuery !== "undefined" ? jQuery : null));

},{"./pattern":2}]},{},[8])(8)
});
