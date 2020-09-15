/**
 * @file        Base GreenHat error.
 * @module      GreenHatError
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

/**
 * Base error class.
 */
class GreenHatError extends Error 
{
    /**
     * Constructor.
     * 
     * @constructor
     * @param   {string}    message         Error message.
     * @param   {string}    context         Context.
     * @param   {Error}     originalError   Original error.
     * 
     * @return  {GreenhatError}             New instance.
     */
    constructor(message, context, originalError) 
    {
        super(message);
        this.name = this.constructor.name;
  
        Error.captureStackTrace(this, this.constructor);
  
        if (context) {
            this.message += `\n => ${context}`;
        }
        
        if (originalError) {
            this.originalError = originalError;
        }
    }
}

module.exports = GreenHatError;