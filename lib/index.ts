"use strict";
import PatternGenerator, { Pattern, IPatternOption } from "./pattern-generator";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str: string, options?: IPatternOption) => Pattern) {
    return function(str: string, options?: IPatternOption) {
        if (typeof str === "object") {
            options = str;
            str = null;
        }
        if (str === null || str === undefined) {
            str = (new Date()).toString();
        }
        if (!options) {
            options = {} as IPatternOption;
        }
        return cb(str, options);
    };
}

const GeoPattern = {
    generate: optArgs((str: string, options?: IPatternOption) => {
        const generator = new PatternGenerator(str, options);
        return generator.Pattern;
    }),
};

export default GeoPattern;

((($) => {
    if ($) {
        // If jQuery, add plugin
        // @ts-ignore
        $.fn.geopattern = optArgs((str: string, options?: IPatternOption) => this.each(() => {
            // @ts-ignore
            const titleSha = $(this).attr("data-title-sha");
            if (titleSha) {
                options = $.extend({
                    hash: titleSha,
                }, options);
            }
            const pattern = GeoPattern.generate(str, options);
            // @ts-ignore
            $(this).css("background-image", pattern.toDataUrl());
        }));
    }
// @ts-ignore
})(typeof jQuery !== "undefined" ? jQuery : null));
