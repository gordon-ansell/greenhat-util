/**
 * @file        Syslog.
 * @module      syslog
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

const Logger = require("./logger");

const syslog = new Logger();

module.exports = syslog;

