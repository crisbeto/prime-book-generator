'use strict';

var fs = require('fs');
var utils = require('./include/utils');
var getMeasurements = require('./include/getMeasurements');

// note that pdfkit seems to have a hard time with longer strings,
// which is why we need to chunk it into pieces.
fs.readFile('./M74207281.txt', 'utf8', (err, data) => {
    var clean = data.replace(/\s/g, '').substring(0, 50000);
    var total = clean.length;
    var outputName = './output.pdf';
    var doc = utils.getDocument();
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
        utils.addText(doc, clean, i, i + measurements.charactersPerLine);
    }

    doc.pipe(fs.createWriteStream(outputName)).on('finish', () =>
        console.log(`\nCreated ${outputName} at ${new Date().toLocaleTimeString()}.`
    ));

    doc.end();
});
