/* *
 *
 *  (c) 2009-2025 Øystein Moseng
 *
 *  Class representing a TimelineChannel with sonification events to play.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
/**
 * Represents a channel of TimelineEvents for an engine (either an instrument
 * or a speaker).
 * @private
 */
var TimelineChannel = /** @class */ (function () {
    function TimelineChannel(type, engine, showPlayMarker, events, muted) {
        if (showPlayMarker === void 0) { showPlayMarker = false; }
        this.type = type;
        this.engine = engine;
        this.showPlayMarker = showPlayMarker;
        this.muted = muted;
        this.events = events || [];
    }
    TimelineChannel.prototype.addEvent = function (event) {
        var lastEvent = this.events[this.events.length - 1];
        if (lastEvent && event.time < lastEvent.time) {
            // Ensure we are sorted by time, so insert at the right place
            var i = this.events.length;
            while (i-- && this.events[i].time > event.time) { /* */ }
            this.events.splice(i + 1, 0, event);
        }
        else {
            this.events.push(event);
        }
        return event;
    };
    TimelineChannel.prototype.mute = function () {
        this.muted = true;
    };
    TimelineChannel.prototype.unmute = function () {
        this.muted = false;
    };
    TimelineChannel.prototype.cancel = function () {
        this.engine.cancel();
    };
    TimelineChannel.prototype.destroy = function () {
        this.engine.destroy();
    };
    return TimelineChannel;
}());
/* *
 *
 *  Default Export
 *
 * */
export default TimelineChannel;
/* *
 *
 *  API declarations
 *
 * */
/**
 * A TimelineEvent object represents a scheduled audio event to play for a
 * SonificationTimeline.
 * @requires modules/sonification
 * @interface Highcharts.SonificationTimelineEvent
 */ /**
* Time is given in milliseconds, where 0 is now.
* @name Highcharts.SonificationTimelineEvent#time
* @type {number}
*/ /**
* A reference to a data point related to the TimelineEvent. Populated when
* sonifying points.
* @name Highcharts.SonificationTimelineEvent#relatedPoint
* @type {Highcharts.Point|undefined}
*/ /**
* Options for an instrument event to be played.
* @name Highcharts.SonificationTimelineEvent#instrumentEventOptions
* @type {Highcharts.SonificationInstrumentScheduledEventOptionsObject|undefined}
*/ /**
* Options for a speech event to be played.
* @name Highcharts.SonificationTimelineEvent#speechOptions
* @type {Highcharts.SonificationSpeakerOptionsObject|undefined}
*/ /**
* The message to speak for speech events.
* @name Highcharts.SonificationTimelineEvent#message
* @type {string|undefined}
*/ /**
* Callback to call when playing the event.
* @name Highcharts.SonificationTimelineEvent#callback
* @type {Function|undefined}
*/
(''); // Keep above doclets in JS file
