/**
 * @file        GreenHat filesystem parser.
 * @module      util/FsParser
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const path = require('path');
const fs = require('fs');

const { sanitizeExtRegex, sanitizeFileRegex, sanitizePathRegex } = require('../regex');
const { checkTypes } = require("../typecheck");
const { syslog } = require('../syslog');
require('../array');

/**
 * Filesystem parser.
 */
class FsParser 
{
    // Private fields.
    #startPath = null;
    #absPath = null;
    #opts = {};
    #regex = {};
    #log = [];
    #results = [];
    
    /**
     * Constructor.
     * 
     * @param   {string}    startPath   Path to start parsing at.
     * @param   {string}    absPath     Absolute path (used for getting relative paths).
     * @param   {object}    opts        Options. 
     */
    constructor(startPath, absPath, opts = {})
    {
        checkTypes(arguments, ['string', 'string', '?object'], 'FsParser:constructor');
        
        this.#startPath = startPath;
        this.#absPath = absPath;
        this.#opts = opts;

        this.#regex = {
            allowPaths: undefined,
            ignorePaths: undefined,
            allowFiles: undefined,
            ignoreFiles: undefined,
            ignoreExts: undefined,
        };

        this.#log = [];

        if (opts) {
            this._configureRegex();
        }
    }

    /**
     * Configure the regex from the options.
     */
    _configureRegex()
    {
        let opts = this.#opts;

        for (let item of ['allowPaths', 'ignorePaths']) {
            if (opts[item]) {
                opts[item] = Array.makeArray(opts[item]);
                let ap = sanitizePathRegex(opts[item]);
                if (ap != '') {
                    this.#regex[item] = new RegExp("^(" + ap + ")", 'i');
                }
            }
        }

        for (let item of ['allowFiles', 'ignoreFiles']) {
            if (opts[item]) {
                opts[item] = Array.makeArray(opts[item]);
                let ap = sanitizeFileRegex(opts[item]);
                if (ap != '') {
                    this.#regex[item] = new RegExp("^(" + ap + ")", 'i');
                }
            }
        }

        if (opts.ignoreExts) {
            opts.ignoreExts = Array.makeArray(opts.ignoreExts);
            let ap = sanitizeExtRegex(opts.ignoreExts);
            if (ap != '') {
                this.#regex.ignoreExts = new RegExp("^(" + ap + ")", 'i');
            }
        }

    }

    /**
     * Start parsing.
     * 
     * @return  {string[]}  Parsed results.
     */
    async parse()
    {
        this.#results = [];
        await this._parseDir(this.#startPath);
        return this.#results;
    }

    /**
     * Parse a directory.
     * 
     * @param   {string}    dir     Directory to parse.
     */
    async _parseDir(dir)
    {
        let entries = fs.readdirSync(dir);

        await Promise.all(entries.map(async entry => {

            let filePath = path.join(dir, entry);
            let stats = fs.statSync(filePath);

            if (stats.isFile() && this._doWeProcessFile(filePath)) {
                this.#results.push(filePath);
            } else if (stats.isDirectory() && this._doWeProcessDir(filePath)) {
                this._parseDir(filePath);
            }

        }));
    }

    /**
     * Do we process a file?
     * 
     * @param   {string}    filePath    File to check.
     * @return  {boolean}               True if we do, else false.
     */
    _doWeProcessFile(filePath)
    {
        let rel = filePath.replace(this.#absPath, '');
        if (path.sep != rel[0]) {
            rel = path.sep + rel;
        }
        let base = path.basename(filePath);
        let ext = path.extname(filePath);

        this._logMsg('FsParser:_doWeProcessFile', `Processing file: ${rel}`);

        // Allow files?
        if (this.#regex.allowFiles) {
            let result = this.#regex.allowFiles.exec(base);            
            if (null !== result) {
                this._logMsg('FsParser:_doWeProcessFile', `   => allow file via: ${result[0]}`);
                return true;
            }
        }

        // Ignore files.
        if (this.#regex.ignoreFiles) {
            let result = this.#regex.ignoreFiles.exec(base);            
            if (null !== result) {
                this._logMsg('FsParser:_doWeProcessFile', `   => ignore file via: ${result[0]}`);
                return false;
            }
        }

        // Ignore extensions.
        if (this.#regex.ignoreExts) {
            let result = this.#regex.ignoreExts.exec(ext);            
            if (null !== result) {
                this._logMsg('FsParser:_doWeProcessFile', `   => ignore file extension via: ${result[0]}`);
                return false;
            }
        }

        if (this.#opts.ignoreFilesByDefault && this.#opts.ignoreFilesByDefault === true) {
            this._logMsg('FsParser:_doWeProcessFile', `   => ignore file by default`);
            return false;
        } else {
            this._logMsg('FsParser:_doWeProcessFile', `   => allow file by default`);
            return true;
        }
    }

    /**
     * Do we process a directory?
     * 
     * @param   {string}    filePath    File to check.
     * @return  {boolean}               True if we do, else false.
     */
    _doWeProcessDir(filePath)
    {
        let rel = filePath.replace(this.#absPath, '');
        if (path.sep != rel[0]) {
            rel = path.sep + rel;
        }
        this._logMsg('FsParser:_doWeProcessDir', `Processing directory: ${rel}`);

        // Allow paths?
        if (this.#regex.allowPaths) {
            let result = this.#regex.allowPaths.exec(rel);            
            if (null !== result) {
                this._logMsg('FsParser:_doWeProcessDir', `   => allow dir via: ${result[0]}`);
                return true;
            }
        }

        // Ignore paths.
        if (this.#regex.ignorePaths) {
            let result = this.#regex.ignorePaths.exec(rel);            
            if (null !== result) {
                this._logMsg('FsParser:_doWeProcessDir', `   => ignore dir via: ${result[0]}`);
                return false;
            }
        }
        
        if (this.#opts.ignorePathsByDefault && this.#opts.ignorePathsByDefault === true) {
            this._logMsg('FsParser:_doWeProcessDir', `   => ignore dir by default`);
            return false;
        } else {
            this._logMsg('FsParser:_doWeProcessDir', `   => allow dir by default`);
            return true;
        }

    }

    /**
     * Log a message.
     * 
     * @param   {string}    func    Function name.
     * @param   {string}    msg     Message.
     */
    _logMsg(func, msg)
    {
        syslog.trace(func, msg);
        this.#log.push({func: func, msg: msg});
    }

    /**
     * Get the message log.
     * 
     * @return  {object[]}          Array of message objects.
     */
    get log()
    {
        return this.#log;
    }
}

module.exports = FsParser;
