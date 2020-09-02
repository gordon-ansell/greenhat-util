/**
 * @file        Translation utilities.
 * @module      util/xlate
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const GreenHatError = require("../error")

/**
 * Translation class.
 */
class XLator
{
    // Privates.
    #lang = 'en_GB';
    #strs = {};

    /**
     * Constructor.
     * 
     * @param   {string}    lang    Language.
     * @param   {object}    strs    Language strings.    
     */
    constructor(lang = 'en_GB', strs = {})
    {
        this.setLang(lang);
        this.loadStrs(strs);
    }

    /**
     * Set the language.
     * 
     * @param   {string}    lang    Language to set.
     * @return  {string}            Old language. 
     */
    setLang(lang)
    {
        let saved = this.#lang;
        this.#lang = lang;
        return saved;
    }

    /**
     * Load some strings.
     * 
     * @param   {object}    strs    Strings to load.
     */
    loadStrs(strs)
    {
        for (let lang in strs) {
            if (!this.#strs[lang]) {
                this.#strs[lang] = {};
            }
            for (let key in strs[lang]) {
                this.#strs[lang][key] = strs[lang][key];
            }
        }
    }

    /**
     * Get a translation.
     * 
     * @param   {string}    key     Key to get.
     * @param   {number}    count   For pluralisation.
     * @return  {string}            Translation. 
     */
    x(key, count = 1)
    {
        let pertinent = null;
        let lang = this.#lang;

        if (this.#strs[lang]) {
            pertinent = this.#strs[lang];
        } else if (this.#lang.includes('_')) {
            let s = this.#lang.split('_');
            if (this.#strs[s[0]]) {
                pertinent = this.#strs[s[0]];
            }
        }

        if (!pertinent) {
            throw new GreenHatError(`No language strings found for ${this.#lang}.`);
        }

        if (!pertinent[key]) {
            throw new GreenHatError(`No language string found for '${key}' in language ${this.#lang}.`);
        }

        if (Array.isArray(pertinent[key])) {
            let len = pertinent[key].length;
            if (len == 1) {
                return pertinent[key][0];
            } else if (len == 2) {
                if (count <= 1) {
                    return pertinent[key][0];
                } else {
                    return pertinent[key][1];
                }
            } else if (pertinent[key][count]) {
                return pertinent[key][count];
            } else {
                throw new GreenHatError(`No language string found for count ${count}, key '${key}' in language ${this.#lang}.`);
            }
        }

        return pertinent[key];
    }
}

module.exports = XLator;
