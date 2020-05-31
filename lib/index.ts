"use strict";
import PatternGenerator, { Pattern, IPatternOption } from "./pattern-generator";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str?: string, options?: IPatternOption) => Pattern) {
    return function(str?: string | IPatternOption, options?: IPatternOption) {
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
        // @ts-ignore
        return cb.call(this, str, options);
    };
}

const GeoPattern = {
    generate: optArgs(function(str?: string, options?: IPatternOption) {
        const generator = new PatternGenerator(str, options);
        return generator.Pattern;
    }),
};

export default GeoPattern;

(function($) {
    if ($) {
        // If jQuery, add plugin
        $.fn.geopattern = optArgs(function(str: string | IPatternOption, options?: IPatternOption) {
            // @ts-ignore
            return this.each(function() {
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
            });
        });
    }
// @ts-ignore
}(typeof jQuery !== "undefined" ? jQuery : null));
