'use strict';

var pdf = require('pdfkit');

module.exports = {
    round: function(number){
        return Math.max(Math.floor(number), 1);
    },
    addText: function(doc, text, start, end){
        return doc.text(text.substring(start, end), { continued: true });
    },
    getDocument: function(extraOptions){
        var options = {
            margins: { top: 10, bottom: 10, right: 0, left: 10 },
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

        return new pdf(options).font('./font/SourceCodePro-Regular.ttf').fontSize(6);
    }
};
