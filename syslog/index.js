/**
 * @file        Log writer.
 * @module      util/syslog
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const chalk = require('chalk');
const util = require('util');
const { checkTypes } = require('../typecheck');
require('../array');

/**
 * Level numbers.
 */
const LEVELS = {
    "stack":     5,
    "trace":    10,
    "debug":    20,
    "advice":   30,
    "info":     40,
    "notice":   50,
    "warning":  60,
    "error":    70,
    "fatal":    80,         
}

/**
 * Level names.
 */
const LEVEL_NAMES = {
     5: 'STACK  ',
    10: 'TRACE  ',
    20: 'DEBUG  ',
    30: 'ADVICE ',
    40: 'INFO   ',
    50: 'NOTICE ',
    60: 'WARNING',
    70: 'ERROR  ',
    80: 'FATAL  ',
}

/**
 * Level colours.
 */
const LEVEL_COLS = {
     5: chalk.grey,
    10: chalk.yellow,
    20: chalk.gray,
    30: chalk.cyan,
    40: chalk.green,
    50: null,
    60: chalk.red,
    70: chalk.redBright,
    80: chalk.whiteBright.bgRed,
}

/**
 * Logger class.
 */
class Logger
{
    /**
     * Level.
     */
    #level = "advice";

    /**
     * Exception traces?
     */
    #exceptionTraces = false;

    /**
     * Trace keys.
     */
    #traceKeys = [];

    /**
     * Indent characters.
     */
    #indentChars = '   ';

    /**
     * Constructor.
     * 
     * @param   {string}    level               Log level string.
     * @param   {boolean}   exceptionTraces     Do we want exception traces?
     */
    constructor(level, exceptionTraces)
    {
        checkTypes(arguments, ['?string'], 'Logger:constructor');

        if (level) {
            this.#level = level;
        }
        if (exceptionTraces) {
            this.#exceptionTraces = exceptionTraces;
        }
    }

    /**
     * Set the level.
     * 
     * @param   {string}    level   Level to set.
     * @return  {string}            Old level.
     */
    setLevel(level)
    {
        checkTypes(arguments, ['string'], 'Logger:setLevel');

        let old = this.#level;
        this.#level = level;
        return old;
    }

    /**
     * Set the exception traces flag.
     * 
     * @param   {boolean}   flag    True or false.
     */
    setExceptionTraces(flag)
    {
        this.#exceptionTraces = flag;
    }

    /**
     * Set the trace keys.
     * 
     * @param   {string|string[]}   keys    Trace keys to set.
     * @return  {string|string[]}           Old trace keys.
     */
    setTraceKeys(keys)
    {
        let saved = this.#traceKeys;
        if (!keys) {
            this.#traceKeys = [];
            return saved;
        }
        this.#traceKeys = Array.makeArray(keys);
        return saved;
    }

    /**
     * Log a message.
     * 
     * @param   {string}    level       Log level for this message.
     * @param   {string}    msg         Message.
     * @param   {string}    context     Optional context. 
     * @param   {number}    indent      Indent level.   
     */
    log(level, msg, context, indent = 0)
    {
        checkTypes(arguments, ['string', 'string', '?string', '?number'], 'Logger:log');

        if (LEVELS[level] >= LEVELS[this.#level] || level == "stack") {

            const dt = new Date().toISOString();
            const col = LEVEL_COLS[LEVELS[level]];

            msg = this.#indentChars.repeat(indent) + msg;

            let str = dt + ' ' + LEVEL_NAMES[LEVELS[level]] + ' ' + msg;

            if (context) {
                str += `\n${context}`;
            }

            if (col !== null) {
                str = col(str);
            }

            switch (level) {
                case "debug":
                case "trace":
                case "stack":
                    console.debug(str);
                    break;
                case "warning":
                    console.warn(str);
                    break;
                case "error":
                case "fatal":
                    console.error(str);
                    break;
                default: // ADVICE, INFO, NOTICE.
                    console.info(str);
            }
        }
    }

    /**
     * Inspect something.
     * 
     * @param  {object} obj      Anything you want to inspect.
     * @param  {string} level    Message level.
     * @param  {string} msg      Message to precede inspect.
     */
    inspect(obj, level = "advice", msg)
    {
        checkTypes(arguments, ['any', '?string', '?string'], 'Logger:inspect');

        if (LEVELS[level] >= LEVELS[this.#level]) {

            if (!msg) {
                msg = "Inspect: ===>";
            } 

            this.log(level, msg);
            console.debug(util.inspect(obj, false, null, true));
        }
    }

    /**
     * Handle an exception.
     * 
     * @param   {Error}     ex              Exception object.
     * @param   {string}    level           Message level.
     * @param   {boolen}    stackTraces     Do we want stack traces?
     */
    exception(ex, level = "error", stackTraces = null)
    {
        let st = (stackTraces === null) ? this.#exceptionTraces : stackTraces;

        this.log(level, ex.message);

        if (ex.stack && st) {
            for (let line of ex.stack.split('\n').slice(1)) {
                this.log("stack", line.trim());
            }
        }

        if (ex.originalError) {
            let orig = ex.originalError;
            let indent = 1;

            while (orig) {
                this.log("error", `==> An exception of type '${orig.name}' was encountered: ${orig.message}`, '', indent);

                if (orig.stack && st) {
                    for (let line of orig.stack.split('\n').slice(1)) {
                        this.log("stack", line.trim(), '', indent);
                    }
                }

                if (orig.originalError) {
                    indent++;
                    orig = orig.originalError;
                } else {
                    orig = null;
                }
            }
        }
    }

    /**
     * Trace message.
     * 
     * @param   {string}    key         Trace key.
     * @param   {string}    msg         Message.
     * @param   {string}    context     Optional context.
     */
    trace(key, msg, context)
    {
        checkTypes(arguments, ['string', 'string', '?string'], 'Logger:trace');

        if (LEVELS["trace"] < LEVELS[this.#level]) {
            return;
        }

        msg = `[${key}] ${msg}`;

        for (let item of this.#traceKeys) {
            if (item.substr(item.length - 1) == "*" && key.startsWith(item.substring(0, item.length - 1))) {
                this.log("trace", msg, context);
            } else if (item == key) {
                this.log("trace", msg, context)
            } 
        }
    }

    /**
     * Shortcut functions.
     */
    fatal(msg, context)      {this.log("fatal", msg, context);}
    error(msg, context)      {this.log("error", msg, context);}
    warning(msg, context)    {this.log("warning", msg, context);}
    notice(msg, context)     {this.log("notice", msg, context);}
    info(msg, context)       {this.log("info", msg, context);}
    advice(msg, context)     {this.log("advice", msg, context);}
    debug(msg, context)      {this.log("debug", msg, context);}
    stack(msg, context)      {this.log("stack", msg, context);}

}

const syslog = new Logger();

exports.Logger = Logger;
exports.syslog = syslog;

