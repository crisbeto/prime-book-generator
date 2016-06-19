'use strict';

/**
 * @param {string} input Source file with large number.
 * @param {string} output Where the file should be written.
 * @param {array|string='A4'} size Array in the format of [x, y], where `x` and `y` are in centimeters.
 * @param {number=6} fontSize Size of the font.
 * @param {number=} charLimit How many characters to print. Defaults to all.
 */

require('./include/generate')({
    input: './M74207281.txt',
    output: './output.pdf',
    size: [17, 22],
    fontSize: 4
});
