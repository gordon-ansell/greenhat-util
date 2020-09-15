/**
 * @file        Merge utilities.
 * @module      merge
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const { isPlainObject } = require('is-plain-object');
const dm = require('deepmerge');

/**
 * Merge things.
 * 
 * @param   {object}    first       First thing.
 * @param   {object}    second      Second thing.
 * @param   {object}    opts        Options.
 * @return  {object}                Merged thing. 
 */
function merge(first, second, opts = {arrayMerge: dm.combineMerge, isMergeableObject: isPlainObject})
{
    return dm(first, second, opts)
}

exports.merge = merge;
