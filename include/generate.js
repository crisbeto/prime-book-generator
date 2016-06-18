'use strict';

var fs = require('fs');
var utils = require('./utils');
var getMeasurements = require('./getMeasurements');

module.exports = function(options){
    fs.readFile(options.input, 'utf8', (err, data) => {
        var clean = data.replace(/\s/g, '').substring(0, 50000);
        var total = clean.length;
        var shouldBeDivisibleBy = 4;
        var doc = utils.getDocument({
            size: options.size || 'A4'
        });
        var measurements = getMeasurements(clean, options);

        console.log([
            `Total characters: ${total}`,
            `Characters per line: ${measurements.charactersPerLine}`,
            `Lines per page: ${measurements.linesPerPage}`,
            `Page dimensions: ${measurements.pageWidth}x${measurements.pageHeight}`,
            `Total pages: ${measurements.totalPages}`,
            `Started at ${new Date().toLocaleTimeString()}`
        ].join('\n'));

        // Pdfkit has a hard time with longer strings, which is why we need
        // to chunk it into pieces. One line at a time seems to be the best.
        // Even one page at a time causes it to hang.
        for(var i = 0; i < total; i += measurements.charactersPerLine){
            // this will go over the total, however substring doesn't really care about it.
            // it can be avoided by using Math.min(i + charactersPerLine, total)
            utils.addText(doc, clean, i, i + measurements.charactersPerLine);
        }

        if(measurements.totalPages % shouldBeDivisibleBy !== 0){
            var extra = (Math.ceil(measurements.totalPages / shouldBeDivisibleBy) * shouldBeDivisibleBy) - measurements.totalPages;

            for(var j = 0; j < extra; j++){
                doc.addPage();
            }

            console.log(`\nAdded ${extra} extra page(s).`);
        }

        doc.pipe(fs.createWriteStream(options.output)).on('finish', () =>
            console.log(`\nCreated ${options.output} at ${new Date().toLocaleTimeString()}`)
        );

        doc.end();
    });
};
