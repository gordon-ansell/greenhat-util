/**
 * @file        Extensions to the native object prototype.
 * @module      util/object
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const isPlainObject = require('is-plain-object');
const dm = require('deepmerge');

if(!Object.merge) {
    /**
     * Merge two objects.
     *
     * @param   {object}    obj1    Object 1.
     * @param   {object}    obj2    Object 2.
     * @param   {object}    opts    Options.
     * @return  {object}            Merged object.
     */
    Object.merge = function (obj1, obj2, opts = {arrayMerge: dm.combineMerge, isMergeableObject: isPlainObject})
    {
        return dm(obj1, obj2, opts);
    }
}

if(!Object.mergeAll) {
    /**
     * Merge an array of objects.
     *
     * @param   {object[]}  objs    Array of objects.
     * @param   {object}    opts    Options.
     * @return  {object}            Merged object.
     */
    Object.mergeAll = function (objs, opts = {arrayMerge: dm.combineMerge, isMergeableObject: isPlainObject})
    {
        return dm.all(objs, opts);
    }
}

if(!Object.datamerge) {
    /**
     * Merge two objects.
     *
     * @param   {object}    obj1    Object 1.
     * @param   {object}    obj2    Object 2.
     * @param   {object}    opts    Options.
     * @return  {object}            Merged object.
     */
    Object.datamerge = function (obj1, obj2, opts = {arrayMerge: dm.combineMerge, isMergeableObject: isPlainObject})
    {
        let ret = {...obj1};

        for (let key in obj2) {
            if (!ret[key]) {
                ret[key] = obj2[key];
            } else if (obj2[key] == null || obj2[key] == undefined || typeof(obj2[key]) == "string") {
                ret[key] = obj2[key];
            } else if (Array.isArray(obj2[key]) && obj2[key].length > 0) {
                ret[key] = Object.merge(ret[key], obj2[key], opts);
                ret[key] = [... new Set(ret[key])];
            } else {
                ret[key] = Object.merge(ret[key], obj2[key], opts);
            }
        }     
        
        return ret;
    }
}
