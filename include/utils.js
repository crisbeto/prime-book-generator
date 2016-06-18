'use strict';

var PDF = require('pdfkit');
var cmToPx = function(val){
    var oneCmInInches = 0.393701;
    var dpi = 72;
    return val*oneCmInInches*dpi;
};

module.exports = {
    round: function(number){
        return Math.max(Math.floor(number), 1);
    },
    addText: function(doc, text, start, end){
        return doc.text(text.substring(start, end), { continued: true });
    },
    getDocument: function(extraOptions, bufferPages){
        var margin = 10;
        var options = {
            bufferPages: !!bufferPages,
            size: 'A4'
        };

        if(extraOptions){
            Object.keys(extraOptions).forEach(function(key){
                var value = extraOptions[key];

                if(typeof value !== 'undefined'){
                    options[key] = value;
                }
            });
        }

        if(Array.isArray(options.size)){
            options.size = [cmToPx(options.size[0]), cmToPx(options.size[1])];
            margin = Math.min(options.size[0], options.size[1]) * 0.01;
        }

        // TODO: these need to alternate based on the page
        options.margins = { top: margin, bottom: margin, right: margin, left: margin };

        return new PDF(options).font('./font/SourceCodePro-Regular.ttf').fontSize(options.fontSize || 6);
    }
};
