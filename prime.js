'use strict';

var fs = require('fs');
var pdf = require('pdfkit');

var getDocument = function(extraOptions){
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
};

var round = function(number){
    return Math.max(Math.floor(number), 1);
};

var getMeasurements = function(text, textOptions){
    var doc = getDocument({
        bufferPages: true
    });
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    var i = 1;
    var linesPerPage = 0;

    if(doc.options.margin){
        pageWidth -= doc.options.margin*2;
        pageHeight -= doc.options.margin*2;
    }else if(doc.options.margins){
        pageWidth -= ((doc.options.margins.left || 0) + (doc.options.margins.right || 0));
        pageHeight -= ((doc.options.margins.top || 0) + (doc.options.margins.bottom || 0));
    }

    // add the first character and measure how much space it takes up
    var characterWidth = doc.text(text.substring(0, i), textOptions)._textOptions.textWidth;

    // calculate how many characters we're allowed per line.
    var charactersPerLine = round(pageWidth/characterWidth);

    // finish the first line. note that we're not adding i
    // because it has been added already
    doc.text(text.substring(i, charactersPerLine), textOptions);
    i += (charactersPerLine - i);

    for(i; i < text.length; i += charactersPerLine){
        doc.text(text.substring(i, i + charactersPerLine), textOptions);

        if(doc.bufferedPageRange().count > 1){
            linesPerPage = round(i/charactersPerLine);
            break;
        }
    }

    doc.end();

    return {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        charactersPerLine: charactersPerLine,
        linesPerPage: linesPerPage
    };
};

// note that pdfkit seems to have a hard time with longer strings,
// which is why we need to chunk it into pieces.
fs.readFile('./M74207281.txt', 'utf8', (err, data) => {
    var clean = data.replace(/\s/g, '').substring(0, 50000);
    var total = clean.length;
    var textOptions = { continued: true };
    var outputName = './output.pdf';
    var doc = getDocument();
    var measurements = getMeasurements(clean, textOptions);

    console.log([
        `Total characters: ${total}`,
        `Characters per line: ${measurements.charactersPerLine}`,
        `Lines per page: ${measurements.linesPerPage}`,
        `Page dimensions: ${measurements.pageWidth}x${measurements.pageHeight}`,
        `Started at ${new Date().toLocaleTimeString()}`
    ].join('\n'));

    for(var i = 0; i < total; i += measurements.charactersPerLine){
        // note that this will go over the total, however substring doesn't really care about it.
        // it can be avoided by using Math.min(i + charactersPerLine, total)
        doc.text(clean.substring(i, i + measurements.charactersPerLine), textOptions);
    }

    doc.pipe(fs.createWriteStream(outputName)).on('finish', () =>
        console.log(`\nCreated ${outputName} at ${new Date().toLocaleTimeString()}.`
    ));

    doc.end();
});
