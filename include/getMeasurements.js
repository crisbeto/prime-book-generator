'use strict';

var utils = require('./utils');

module.exports = function(text, options){
    var doc = utils.getDocument(options, true);
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    var opts = doc.options;
    var linesPerPage = 0;
    var textLength = text.length;

    if(doc.options.margin){
        pageWidth -= opts.margin*2;
        pageHeight -= opts.margin*2;
    }else if(opts.margins){
        pageWidth -= ((opts.margins.left || 0) + (opts.margins.right || 0));
        pageHeight -= ((opts.margins.top || 0) + (opts.margins.bottom || 0));
    }

    // measure how much text a character takes up
    var characterWidth = doc.widthOfString(text.substring(0, 1));

    // calculate how many characters we're allowed per line.
    var charactersPerLine = utils.round(pageWidth/characterWidth);

    for(var i = 0; i < textLength; i += charactersPerLine){
        utils.addText(doc, text, i, i + charactersPerLine);

        if(doc.bufferedPageRange().count > 1){
            linesPerPage = utils.round(i/charactersPerLine);
            break;
        }
    }

    if(!linesPerPage){
        linesPerPage = utils.round(i/charactersPerLine);
    }

    doc.end();

    return {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        charactersPerLine: charactersPerLine,
        linesPerPage: linesPerPage,
        totalPages: Math.round(textLength/linesPerPage/charactersPerLine)
    };
};
