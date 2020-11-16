/**
 * @file        Multi content format.
 * @module      MultiContent
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const showdown = require('showdown');
const footnotes = require('@webdesigndecal/showdown-footnotes');
const striptags = require("striptags");
const syslog = require('./syslog');

/**
 * Multi content object.
 */
class MultiContent
{
    /**
     * Converter.
     * 
     * @var {object}
     */
    static #mdConv = null;

    /**
     * Constructor.
     * 
     * @param   {string}    raw         Raw input.
     * @param   {object}    context     Context.
     */
    constructor(raw, context)
    {
        this.md = '';
        this.html = '';
        this.text = '';

        if (raw && raw != '') {
            this.md = raw;
            try {
                this.html = MultiContent.mdConv.makeHtml(raw);
            } catch (err) {
                syslog.error(`Error parsing markdown: ${err.message}`, context);
                return;
            }
            this.text = striptags(this.html);
        }
    }

    /**
     * Get the markdown converter.
     * 
     * @return  {object}
     */
    static get mdConv()
    {
        if (MultiContent.#mdConv === null) {
            MultiContent.#mdConv = new showdown.Converter({ extensions: [footnotes] });
            MultiContent.#mdConv.setOption('strikethrough', true);
            MultiContent.#mdConv.setOption('tables', true);
        }
        return MultiContent.#mdConv;
    }
}

module.exports = MultiContent;
