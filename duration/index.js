/**
 * @file        Duration class.
 * @module      util/duration
 * @author      Gordon Ansell   <contact@gordonansell.com> 
 * @copyright   Gordon Ansell, 2020.
 * @license     MIT
 */

'use strict';

/**
 * Duration class.
 */
class Duration
{
    /**
     * Constructor.
     * 
     * @param   {number}     mins    Raw duration in minutes.
     */
    constructor(mins)
    {
        this.mins = mins;

        if (mins < 60) {
            this.pt = 'PT' + mins + 'M';
            this.txt = mins + ' minutes';
            return;
        }

        let hrs = Math.floor(mins / 60);
        let m = mins - (hrs * 60);
        this.pt = 'PT' + hrs + 'H' + m + 'M';
        this.txt = hrs + ' hours ' + m + ' minutes ';

    }
}

module.exports = Duration;