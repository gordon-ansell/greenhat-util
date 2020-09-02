/**
 * @file        Event manager.
 * @module      util/EventManager
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';
const GreenHatError = require("../error");

/**
 * Event manager class.
 */
class EventManager
{
    // Private events.
    #events = {};

    // Valid events.
    #validEvents = [];

    /**
     * Constructor.
     */
    constructor () {}

    /**
     * Set the valid events.
     * 
     * @param   {string[]}  ev          Array of valid event names. 
     */
    setValidEvents(ev)
    {
        this.#validEvents = ev;
        return this;
    }

    /**
     * Add a plugin to an event.
     * 
     * @param   {string}    event       Event.
     * @param   {function}  func        Function to call.
     * @param   {number}    pri         Priority.
     */
    on(event, func, pri)
    {
        if (!this.#validEvents.includes(event)) {
            throw new GreenHatError(`'${event}' is an invalid event name.`);
        }
        if (typeof func != "function") {
            throw new GreenHatError("Event 'on' must be passed a function (${event}).");
        }
        if (!pri) {
            pri = 50;
        }
        if (!this.#events[event]) {
            this.#events[event] = [];
        }
        this.#events[event].push({func: func, pri: pri});
    }

    /**
     * Emit an event.
     * 
     * @param   {string}    event       Event.
     * @param   {any}       args        Arguments. 
     */
    async emit(event, ...args)
    {
        if (!this.#validEvents.includes(event)) {
            throw new GreenHatError(`'${event}' is an invalid event name.`);
        }
        if (!this.#events[event]) {
            return;
        }

        let sorted = this.#events[event].sort((a, b) => {
            if (a.pri < b.pri) {
                return -1;
            }
            if (b.pri < a.pri) {
                return 1;
            }
            return 0;    
        });

        let pri = {};

        for (let cb of sorted) {
            if (!pri[cb.pri]) {
                pri[cb.pri] = [];
            }
            pri[cb.pri].push(cb.func);
        }

        for (let key in pri) {
            let funcs = pri[key];
            await Promise.all(funcs.map(async f => {
                try {
                    f.call(this, ...args);
                } catch (err) {
                    throw new GreenHatError(`Event function call failed for ${event}.`, '', err);
                }
            }));
        }
    }

}

module.exports = EventManager;
