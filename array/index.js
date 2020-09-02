/**
 * @file        Extensions to the native array prototype.
 * @module      util/array
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

if(!Array.makeArray) {
    /**
     * Make something into an array if it isn't already.
     * 
     * @param   {any}       whatever    Whatever you want to make into an array.
     * @return  {Array}                 Converted to an array.
     */
    Array.makeArray = function(whatever)
    {
        return (Array.isArray(whatever)) ? whatever : [whatever];
    }
}

if(!Array.prototype.isEmpty) {
    Object.defineProperty(Array.prototype, 'isEmpty',
    {
        /**
         * See if an array is empty.
         * 
         * @return  {Boolean}               True if it is, else false.
         */
        value: function(whatever)
        {
            return this.length === 0;
        },
        enumerable: false
    });
}
