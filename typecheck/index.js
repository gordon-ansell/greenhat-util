/**
 * @file        Type checking utilities.
 * @module      util/typecheck
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

/**
 * Return a reliable type for an object or variable. Better version of 'typeof'.
 * @see https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 * 
 * @param   {any}       obj     Thing to test.
 * @return  {string}            Type string.
 */
function typeOf(obj) 
{
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

/**
 * Check argument types.
 * 
 * @param   {any}       args        Arguments to check.
 * @param   {string[]}  types       Types to check them against.
 * @param   {string}    context     Optional context for exception message.
 * 
 * @throws  {TypeError}             If any of the arguments fail the test.
 */
function checkTypes(args, types, context) 
{
    args = [].slice.call(args);
    for (var i = 0; i < types.length; i++) {
        let type = types[i];

        if (type == 'any') {
            continue;
        }

        if (type[0] == '?' && typeof args[i] === "undefined") {
            continue;
        } else if (type[0] == '?') {
            type = type.substring(1);
        }

        let to = typeOf(args[i]);

        if (to != type) {
            let msg = `Argument ${i} must be of type ${type} but we were passed a type of ${to}.`;
            if (context) msg += ` [${context}]`;
            throw new TypeError(msg);
        }
    }
}
  

exports.typeOf = typeOf;
exports.checkTypes = checkTypes;
