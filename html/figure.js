/**
 * @file        HTML figure helper.
 * @module      util/html/figure
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const Html = require('./index');

/**
 * HTML figure helper class.
 */
class Figure extends Html
{
    /**
     * Constructor.
     * 
     * @param   {string}    tag     HTML tag.
     */
    constructor(tag)
    {
        super(tag, 'figcaption');
    }

}

module.exports = Figure;

