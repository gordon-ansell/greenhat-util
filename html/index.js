/**
 * @file        HTML helper.
 * @module      util/html
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

/**
 * HTML helper class.
 */
class Html
{
    static _selfClose = ['img'];

    /**
     * Constructor.
     * 
     * @param   {string}    tag     HTML tag.
     * @param   {string}    inner   Inner HTML tag.
     */
    constructor(tag, inner)
    {
        this.tag = tag;
        this.params = {};
        this.data = null;
        this.inner = null;
        if (inner) {
            this.inner = new Html(inner);
        }

    }

    /**
     * Get the inner.
     * 
     * @return  {object}    Inner HTML onject.
     */
    getInner()
    {
        return (this.inner) ? this.inner : null;
    }

    /**
     * Add a parameter.
     * 
     * @param   {string}    name    Parameter name.
     * @param   {any}       val     Parameter value.
     * @return  {object}            Ourself.
     */
    addParam(name, val)
    {
        if (!val) {
            if (this.params[name]) {
                unset(this.params[name]);
            }
            return this;
        }

        if (name == 'data') {
            this.data = val;
            return this;
        }

        this.params[name] = val;
        return this;
    }

    /**
     * Append to a parameter.
     * 
     * @param   {string}    name    Parameter name.
     * @param   {any}       val     Parameter value.
     * @param   {string}    sep     Separator.
     * @return  {object}            Ourself.
     */
    appendParam(name, val, sep = ' ')
    {
        if (!this.params[name]) {
            return this.addParam(name, val);
        }

        if (this.params[name] != '') {
            this.params[name] += sep;    
        }
        this.params[name] += val;
        return this;
    }

    /**
     * Set the data.
     * 
     * @param   {any}       data    Data to set.
     * @return  {object}            Ourself.
     */
    setData(data)
    {
        this.data = data;
        return this;
    }

    /**
     * Is this a self closer?
     * 
     * @return  {boolean}           True if we are.
     */
    get isSelfCloser()
    {
        return Html._selfClose.includes(this.tag);
    }

    /**
     * Resolve the HTML.
     * 
     * @param   {any}       data    Data to resolve with.
     * @return  {string}            HTML string.
     */
    resolve(data)
    {
        if (data) {
            this.data = data;
        }

        let html = '<' + this.tag + ' ';

        let p = [];
        
        for (let key in this.params) {
            if (typeof this.params[key] == 'boolean') {
                p.push(key);
            } else {
                p.push(key + '="' + this.params[key] + '"');
            }
        }

        html += p.join(' ');

        if (this.isSelfCloser) {
            html += ' />';
            return html;
        }

        html += '>';

        if (this.data) {
            if (this.data instanceof Html) {
                html += this.data.resolve();
            } else {
                html += this.data;
            }
        }

        if (this.inner) {
            html += this.inner.resolve();
        }

        html += '</' + this.tag + '>';

        return html;
    }


}

module.exports = Html;

