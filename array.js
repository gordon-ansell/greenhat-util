/**
 * @file        Extensions to the native array prototype.
 * @module      array
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const GreenHatError = require("./error");

/**
 * Make something into an array if it isn't already.
 * 
 * @param   {any}       whatever    Whatever you want to make into an array.
 * @return  {Array}                 Converted to an array.
 */
function makeArray(whatever)
{
    return (Array.isArray(whatever)) ? whatever : [whatever];
}

/**
 * See if an array is empty.
 * 
 * @param   {Array}     test        Array to test.
 * @return  {boolean}               True if it is, else false.
 */
function isEmpty(test)
{
    if (!Array.isArray(test)) {
        throw new GreenHatError(`isEmpty must have an array passed to it.`);
    }
    return test.length === 0;
}

exports.makeArray = makeArray;
exports.isEmpty = isEmpty;
