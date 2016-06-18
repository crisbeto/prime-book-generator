'use strict';

require('./include/generate')({
    input: './M74207281.txt',
    output: './output.pdf',
    size: [17, 22], // in cm
    fontSize: 4 // TODO: 6 works fine, 4 doesn't for some reason
});
