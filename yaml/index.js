/**
 * @file        YAML parser.
 * @module      util/yaml
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const GreenHatError = require("../error");
const fs = require('fs');
const yaml = require('yaml');
require('../object');
require('../string');

class GreenHatYamlError extends GreenHatError {};

/**
 * YAML file class.
 */
class YamlFile
{
    // Privates.
    #filePath = null;
    #opts = {open: '---', close: '---', partial: false, limited: false};

    /**
     * Constructor.
     *
     * @constructor 
     * @param   {string}    filePath    Path to the YAML file.
     * @param   {object}    opts        Options.
     * 
     * @return  {YamlParser}            New instance.
     */
    constructor(filePath, opts)
    {
        this.#filePath = filePath;
        if (opts) {
            this.#opts = Object.merge(this.#opts, opts);
        }
        this.content = '';
    }

    /**
     * Parse it.
     * 
     * @return  {object}                Parsed data.
     */
    parse()
    {
        if (!fs.existsSync(this.#filePath)) {
            throw new GreenHatYamlError(`No YAML file found at ${this.#filePath}.`);
        }

        if (this.#opts.partial == true) {
            if (this.#opts.limited == true) {
                this.parsePartial();
                return {};
            } else {
                let ret = yaml.parse(this.parsePartial());
                return (ret === null) ? {} : ret;
            }
        }

        let yamlData = {};

        try {
            let fileData = fs.readFileSync(this.#filePath, 'utf8');
            yamlData = yaml.parse(fileData.tabsToSpaces());
        } catch (err) {
            let msg = err.message;
            if (err.message.includes('Nested mappings are not allowed in compact mappings')) {
                msg += ". This particular error is probably to do with the way you indented the file."
                msg += " Try not to be so silly next time."
            }
            throw new GreenHatYamlError(`Failed to parse YAML file: '${this.#filePath}`, msg, err);
        }

        return yamlData;
    }

    /**
     * Parse partial.
     * 
     * @return  {object}                Parsed data.
     */
    parsePartial()
    {
        if (!fs.existsSync(this.#filePath)) {
            throw new GreenHatYamlError(`No YAML file found at ${this.#filePath}.`);
        }

        let delims = 0;
        let yamlData = '';

        try {

            let fileData = fs.readFileSync(this.#filePath, 'utf8').split('\r\n').join('\n').tabsToSpaces();

            const lines = fileData.split('\n');

            let contentData = '';
    
            if (this.#opts.limited == true) {
                lines.forEach(line => {
                    contentData += line + '\n';
                });
                return null;
            }
    
            lines.forEach(line => {
                if (0 == delims && this.#opts.open == line) {
                    delims++;
                } else if (1 == delims && this.#opts.close == line) {
                    delims++;
                } else if (1 == delims) {
                    yamlData += line + '\n';
                } else {
                    contentData += line + '\n';
                }
            });
    
    
            this.content = contentData;
    
        } catch (err) {
            let msg = err.message;
            if (err.message.includes('Nested mappings are not allowed in compact mappings')) {
                msg += ". This particular error is probably to do with the way you indented the file."
                msg += " Try not to be so silly next time."
            }
            throw new GreenHatYamlError(`Failed to parse YAML file: '${this.#filePath}`, msg, err);
        }

        if (0 == delims) {
            throw new GreenHatYamlError(`Did not find opening delimiter '${this.#opts.open}' in YAML file ${this.#filePath}.`);
        } else if (1 == delims) {
            throw new GreenHatYamlError(`Did not find closing delimiter '${this.#opts.close}' in YAML file ${this.#filePath}.`);
        }

        return yamlData;
    }

}

module.exports = YamlFile;
