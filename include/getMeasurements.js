'use strict';

var utils = require('./utils');

module.exports = function(text){
    var doc = utils.getDocument({
        bufferPages: true
    });
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    var opts = doc.options;
    var i = 1;
    var linesPerPage = 0;
    var textLength = text.length;

    if(doc.options.margin){
        pageWidth -= opts.margin*2;
        pageHeight -= opts.margin*2;
    }else if(opts.margins){
        pageWidth -= ((opts.margins.left || 0) + (opts.margins.right || 0));
        pageHeight -= ((opts.margins.top || 0) + (opts.margins.bottom || 0));
    }

    // add the first character and measure how much space it takes up
    var characterWidth = utils.addText(doc, text, 0, i)._textOptions.textWidth;

    // calculate how many characters we're allowed per line.
    var charactersPerLine = utils.round(pageWidth/characterWidth);

    // finish the first line. note that we're not adding i
    // because it has been added already
    utils.addText(doc, text, i, charactersPerLine);
    i += (charactersPerLine - i);

    for(i; i < textLength; i += charactersPerLine){
        utils.addText(doc, text, i, i + charactersPerLine);

        if(doc.bufferedPageRange().count > 1){
            linesPerPage = utils.round(i/charactersPerLine);
            break;
        }
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
