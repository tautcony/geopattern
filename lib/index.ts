"use strict";
import Pattern, { IOption } from "./pattern";

/*
 * Normalize arguments, if not given, to:
 * string: (new Date()).toString()
 * options: {}
 */
function optArgs(cb: (str?: string, options?: IOption) => void) {
    return function(str?: string | IOption, options?: IOption) {
        if (typeof str === "object") {
            options = str;
            str = null;
        }
        if (str === null || str === undefined) {
            str = (new Date()).toString();
        }
        if (!options) {
            options = {} as IOption;
        }
        // @ts-ignore
        return cb.call(this, str, options);
    };
}

const GeoPattern = {
    generate: optArgs(function(str?: string, options?: IOption) {
        return new Pattern(str, options);
    }),
};

export default GeoPattern;

(function($) {
    if ($) {
        // If jQuery, add plugin
        $.fn.geopattern = optArgs(function(str: string | IOption, options?: IOption) {
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
