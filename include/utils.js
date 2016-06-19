'use strict';

var PDF = require('pdfkit');
var utils = {};

var cmToPx = val => val * 0.393701 * 72;
var round = number => Math.max(Math.floor(number), 1);

utils.addText = (doc, text, start, end) => {
    doc.text(text.substring(start, end), { continued: true });
};

utils.getDocument = options => {
    var margin = 10;

    if (Array.isArray(options.size)) {
        options.size = [cmToPx(options.size[0]), cmToPx(options.size[1])];
        margin = Math.min(options.size[0], options.size[1]) * 0.01;
    } else {
        options.size = 'A4';
    }

    // TODO: these need to alternate based on the page
    options.margins = { top: margin, bottom: margin, right: margin, left: margin };

    return new PDF(options).font('./font/SourceCodePro-Regular.ttf').fontSize(options.fontSize || 6);
};

utils.measure = (doc, text) => {
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    var opts = doc.options;

    if (doc.options.margin) {
        pageWidth -= opts.margin * 2;
        pageHeight -= opts.margin * 2;
    }else if (opts.margins) {
        pageWidth -= ((opts.margins.left || 0) + (opts.margins.right || 0));
        pageHeight -= ((opts.margins.top || 0) + (opts.margins.bottom || 0));
    }

    var characterWidth = doc.widthOfString(text.substring(0, 1));
    var charactersPerLine = round(pageWidth / characterWidth);
    var linesPerPage = round(pageHeight / doc.currentLineHeight());

    return {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        charactersPerLine: charactersPerLine,
        linesPerPage: linesPerPage,
        totalPages: Math.round(text.length / linesPerPage / charactersPerLine)
    };
};

module.exports = utils;
