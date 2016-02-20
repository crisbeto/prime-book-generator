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

var addText = function(doc, text, start, end){
    return doc.text(text.substring(start, end), { continued: true });
};

var getMeasurements = function(text){
    var doc = getDocument({
        bufferPages: true
    });
    var pageWidth = doc.page.width;
    var pageHeight = doc.page.height;
    var opts = doc.options;
    var i = 1;
    var linesPerPage = 0;

    if(doc.options.margin){
        pageWidth -= opts.margin*2;
        pageHeight -= opts.margin*2;
    }else if(opts.margins){
        pageWidth -= ((opts.margins.left || 0) + (opts.margins.right || 0));
        pageHeight -= ((opts.margins.top || 0) + (opts.margins.bottom || 0));
    }

    // add the first character and measure how much space it takes up
    var characterWidth = addText(doc, text, 0, i)._textOptions.textWidth;

    // calculate how many characters we're allowed per line.
    var charactersPerLine = round(pageWidth/characterWidth);

    // finish the first line. note that we're not adding i
    // because it has been added already
    addText(doc, text, i, charactersPerLine);
    i += (charactersPerLine - i);

    for(i; i < text.length; i += charactersPerLine){
        addText(doc, text, i, i + charactersPerLine);

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
    var outputName = './output.pdf';
    var doc = getDocument();
    var measurements = getMeasurements(clean);

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
        addText(doc, clean, i, i + measurements.charactersPerLine);
    }

    doc.pipe(fs.createWriteStream(outputName)).on('finish', () =>
        console.log(`\nCreated ${outputName} at ${new Date().toLocaleTimeString()}.`
    ));

    doc.end();
});
