/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import Axis from './Axis.js';
import DataTableCore from '../../Data/DataTableCore.js';
import H from '../Globals.js';
import U from '../Utilities.js';
var addEvent = U.addEvent, correctFloat = U.correctFloat, css = U.css, defined = U.defined, error = U.error, isNumber = U.isNumber, pick = U.pick, timeUnits = U.timeUnits, isString = U.isString;
/* *
 *
 *  Composition
 *
 * */
/**
 * Extends the axis with ordinal support.
 * @private
 */
var OrdinalAxis;
(function (OrdinalAxis) {
    /* *
     *
     *  Declarations
     *
     * */
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Extends the axis with ordinal support.
     *
     * @private
     *
     * @param AxisClass
     * Axis class to extend.
     *
     * @param ChartClass
     * Chart class to use.
     *
     * @param SeriesClass
     * Series class to use.
     */
    function compose(AxisClass, SeriesClass, ChartClass) {
        var axisProto = AxisClass.prototype;
        if (!axisProto.ordinal2lin) {
            axisProto.getTimeTicks = getTimeTicks;
            axisProto.index2val = index2val;
            axisProto.lin2val = lin2val;
            axisProto.val2lin = val2lin;
            // Record this to prevent overwriting by broken-axis module (#5979)
            axisProto.ordinal2lin = axisProto.val2lin;
            addEvent(AxisClass, 'afterInit', onAxisAfterInit);
            addEvent(AxisClass, 'foundExtremes', onAxisFoundExtremes);
            addEvent(AxisClass, 'afterSetScale', onAxisAfterSetScale);
            addEvent(AxisClass, 'initialAxisTranslation', onAxisInitialAxisTranslation);
            addEvent(ChartClass, 'pan', onChartPan);
            addEvent(ChartClass, 'touchpan', onChartPan);
            addEvent(SeriesClass, 'updatedData', onSeriesUpdatedData);
        }
        return AxisClass;
    }
    OrdinalAxis.compose = compose;
    /**
     * In an ordinal axis, there might be areas with dense concentrations of
     * points, then large gaps between some. Creating equally distributed
     * ticks over this entire range may lead to a huge number of ticks that
     * will later be removed. So instead, break the positions up in
     * segments, find the tick positions for each segment then concatenize
     * them. This method is used from both data grouping logic and X axis
     * tick position logic.
     * @private
     */
    function getTimeTicks(normalizedInterval, min, max, startOfWeek, positions, closestDistance, findHigherRanks) {
        if (positions === void 0) { positions = []; }
        if (closestDistance === void 0) { closestDistance = 0; }
        var higherRanks = {}, tickPixelIntervalOption = this.options.tickPixelInterval, time = this.chart.time, 
        // Record all the start positions of a segment, to use when
        // deciding what's a gap in the data.
        segmentStarts = [];
        var end, segmentPositions, hasCrossedHigherRank, info, outsideMax, start = 0, groupPositions = [], lastGroupPosition = -Number.MAX_VALUE;
        // The positions are not always defined, for example for ordinal
        // positions when data has regular interval (#1557, #2090)
        if ((!this.options.ordinal && !this.options.breaks) ||
            !positions ||
            positions.length < 3 ||
            typeof min === 'undefined') {
            return time.getTimeTicks.apply(time, arguments);
        }
        // Analyze the positions array to split it into segments on gaps
        // larger than 5 times the closest distance. The closest distance is
        // already found at this point, so we reuse that instead of
        // computing it again.
        var posLength = positions.length;
        for (end = 0; end < posLength; end++) {
            outsideMax = end && positions[end - 1] > max;
            if (positions[end] < min) { // Set the last position before min
                start = end;
            }
            if (end === posLength - 1 ||
                positions[end + 1] - positions[end] > closestDistance * 5 ||
                outsideMax) {
                // For each segment, calculate the tick positions from the
                // getTimeTicks utility function. The interval will be the
                // same regardless of how long the segment is.
                if (positions[end] > lastGroupPosition) { // #1475
                    segmentPositions = time.getTimeTicks(normalizedInterval, positions[start], positions[end], startOfWeek);
                    // Prevent duplicate groups, for example for multiple
                    // segments within one larger time frame (#1475)
                    while (segmentPositions.length &&
                        segmentPositions[0] <= lastGroupPosition) {
                        segmentPositions.shift();
                    }
                    if (segmentPositions.length) {
                        lastGroupPosition =
                            segmentPositions[segmentPositions.length - 1];
                    }
                    segmentStarts.push(groupPositions.length);
                    groupPositions = groupPositions.concat(segmentPositions);
                }
                // Set start of next segment
                start = end + 1;
            }
            if (outsideMax) {
                break;
            }
        }
        // Get the grouping info from the last of the segments. The info is
        // the same for all segments.
        if (segmentPositions) {
            info = segmentPositions.info;
            // Optionally identify ticks with higher rank, for example
            // when the ticks have crossed midnight.
            if (findHigherRanks && info.unitRange <= timeUnits.hour) {
                end = groupPositions.length - 1;
                // Compare points two by two
                for (start = 1; start < end; start++) {
                    if (time.dateFormat('%d', groupPositions[start]) !==
                        time.dateFormat('%d', groupPositions[start - 1])) {
                        higherRanks[groupPositions[start]] = 'day';
                        hasCrossedHigherRank = true;
                    }
                }
                // If the complete array has crossed midnight, we want
                // to mark the first positions also as higher rank
                if (hasCrossedHigherRank) {
                    higherRanks[groupPositions[0]] = 'day';
                }
                info.higherRanks = higherRanks;
            }
            // Save the info
            info.segmentStarts = segmentStarts;
            groupPositions.info = info;
        }
        else {
            error(12, false, this.chart);
        }
        // Don't show ticks within a gap in the ordinal axis, where the
        // space between two points is greater than a portion of the tick
        // pixel interval
        if (findHigherRanks && defined(tickPixelIntervalOption)) {
            var length_1 = groupPositions.length, translatedArr = [], distances = [];
            var itemToRemove = void 0, translated = void 0, lastTranslated = void 0, medianDistance = void 0, distance = void 0, i = length_1;
            // Find median pixel distance in order to keep a reasonably even
            // distance between ticks (#748)
            while (i--) {
                translated = this.translate(groupPositions[i]);
                if (lastTranslated) {
                    distances[i] = lastTranslated - translated;
                }
                translatedArr[i] = lastTranslated = translated;
            }
            distances.sort(function (a, b) { return a - b; });
            medianDistance = distances[Math.floor(distances.length / 2)];
            if (medianDistance < tickPixelIntervalOption * 0.6) {
                medianDistance = null;
            }
            // Now loop over again and remove ticks where needed
            i = groupPositions[length_1 - 1] > max ? length_1 - 1 : length_1; // #817
            lastTranslated = void 0;
            while (i--) {
                translated = translatedArr[i];
                distance = Math.abs(lastTranslated - translated);
                // #4175 - when axis is reversed, the distance, is negative but
                // tickPixelIntervalOption positive, so we need to compare the
                // same values
                // Remove ticks that are closer than 0.6 times the pixel
                // interval from the one to the right, but not if it is close to
                // the median distance (#748).
                if (lastTranslated &&
                    distance < tickPixelIntervalOption * 0.8 &&
                    (medianDistance === null || distance < medianDistance * 0.8)) {
                    // Is this a higher ranked position with a normal
                    // position to the right?
                    if (higherRanks[groupPositions[i]] &&
                        !higherRanks[groupPositions[i + 1]]) {
                        // Yes: remove the lower ranked neighbour to the
                        // right
                        itemToRemove = i + 1;
                        lastTranslated = translated; // #709
                    }
                    else {
                        // No: remove this one
                        itemToRemove = i;
                    }
                    groupPositions.splice(itemToRemove, 1);
                }
                else {
                    lastTranslated = translated;
                }
            }
        }
        return groupPositions;
    }
    /**
     * Get axis position of given index of the extended ordinal positions.
     * Used only when panning an ordinal axis.
     *
     * @private
     * @function Highcharts.Axis#index2val
     * @param {number} index
     * The index value of searched point
     */
    function index2val(index) {
        var axis = this, ordinal = axis.ordinal, 
        // Context could be changed to extendedOrdinalPositions.
        ordinalPositions = ordinal.positions;
        // The visible range contains only equally spaced values.
        if (!ordinalPositions) {
            return index;
        }
        var i = ordinalPositions.length - 1, distance;
        if (index < 0) { // Out of range, in effect panning to the left
            index = ordinalPositions[0];
        }
        else if (index > i) { // Out of range, panning to the right
            index = ordinalPositions[i];
        }
        else { // Split it up
            i = Math.floor(index);
            distance = index - i; // The decimal
        }
        if (typeof distance !== 'undefined' &&
            typeof ordinalPositions[i] !== 'undefined') {
            return ordinalPositions[i] + (distance ?
                distance *
                    (ordinalPositions[i + 1] - ordinalPositions[i]) :
                0);
        }
        return index;
    }
    /**
     * Translate from linear (internal) to axis value.
     *
     * @private
     * @function Highcharts.Axis#lin2val
     * @param {number} val
     * The linear abstracted value.
     */
    function lin2val(val) {
        var axis = this, ordinal = axis.ordinal, localMin = axis.old ? axis.old.min : axis.min, localA = axis.old ? axis.old.transA : axis.transA;
        // Always use extendedPositions (#19816)
        var positions = ordinal.getExtendedPositions();
        // In some cases (especially in early stages of the chart creation) the
        // getExtendedPositions might return undefined.
        if (positions === null || positions === void 0 ? void 0 : positions.length) {
            // Convert back from modivied value to pixels. // #15970
            var pixelVal = correctFloat((val - localMin) * localA +
                axis.minPixelPadding), index = correctFloat(ordinal.getIndexOfPoint(pixelVal, positions)), mantissa = correctFloat(index % 1);
            // Check if the index is inside position array. If true,
            // read/approximate value for that exact index.
            if (index >= 0 && index <= positions.length - 1) {
                var leftNeighbour = positions[Math.floor(index)], rightNeighbour = positions[Math.ceil(index)], distance = rightNeighbour - leftNeighbour;
                return positions[Math.floor(index)] + mantissa * distance;
            }
        }
        // If the value is outside positions array, return initial value
        return val; // #16784
    }
    /**
     * Internal function to calculate the precise index in ordinalPositions
     * array.
     * @private
     */
    function getIndexInArray(ordinalPositions, val) {
        var index = OrdinalAxis.Additions.findIndexOf(ordinalPositions, val, true);
        if (ordinalPositions[index] === val) {
            return index;
        }
        var percent = (val - ordinalPositions[index]) /
            (ordinalPositions[index + 1] - ordinalPositions[index]);
        return index + percent;
    }
    /**
    * @private
    */
    function onAxisAfterInit() {
        var axis = this;
        if (!axis.ordinal) {
            axis.ordinal = new OrdinalAxis.Additions(axis);
        }
    }
    /**
     * @private
     */
    function onAxisFoundExtremes() {
        var axis = this, eventArgs = axis.eventArgs, options = axis.options;
        if (axis.isXAxis &&
            defined(options.overscroll) &&
            options.overscroll !== 0 &&
            isNumber(axis.max) &&
            isNumber(axis.min)) {
            if (axis.options.ordinal && !axis.ordinal.originalOrdinalRange) {
                // Calculate the original ordinal range
                axis.ordinal.getExtendedPositions(false);
            }
            if (axis.max === axis.dataMax &&
                (
                // Panning is an exception. We don't want to apply
                // overscroll when panning over the dataMax
                (eventArgs === null || eventArgs === void 0 ? void 0 : eventArgs.trigger) !== 'pan' ||
                    axis.isInternal) &&
                // Scrollbar buttons are the other execption
                (eventArgs === null || eventArgs === void 0 ? void 0 : eventArgs.trigger) !== 'navigator') {
                var overscroll = axis.ordinal.convertOverscroll(options.overscroll);
                axis.max += overscroll;
                // Live data and buttons require translation for the min:
                if (!axis.isInternal &&
                    defined(axis.userMin) &&
                    (eventArgs === null || eventArgs === void 0 ? void 0 : eventArgs.trigger) !== 'mousewheel') {
                    axis.min += overscroll;
                }
            }
        }
    }
    /**
     * For ordinal axis, that loads data async, redraw axis after data is
     * loaded. If we don't do that, axis will have the same extremes as
     * previously, but ordinal positions won't be calculated. See #10290
     * @private
     */
    function onAxisAfterSetScale() {
        var axis = this;
        if (axis.horiz && !axis.isDirty) {
            axis.isDirty = axis.isOrdinal &&
                axis.chart.navigator &&
                !axis.chart.navigator.adaptToUpdatedData;
        }
    }
    /**
     * @private
     */
    function onAxisInitialAxisTranslation() {
        var axis = this;
        if (axis.ordinal) {
            axis.ordinal.beforeSetTickPositions();
            axis.tickInterval = axis.ordinal.postProcessTickInterval(axis.tickInterval);
        }
    }
    /**
     * Extending the Chart.pan method for ordinal axes
     * @private
     */
    function onChartPan(e) {
        var _a;
        var chart = this, xAxis = chart.xAxis[0], overscroll = xAxis.ordinal.convertOverscroll(xAxis.options.overscroll), chartX = e.originalEvent.chartX, panning = chart.options.chart.panning;
        var runBase = false;
        if (panning &&
            panning.type !== 'y' &&
            xAxis.options.ordinal &&
            xAxis.series.length &&
            // On touch devices, let default function handle the pinching
            (!e.touches || e.touches.length <= 1)) {
            var mouseDownX = chart.mouseDownX, extremes = xAxis.getExtremes(), dataMin = extremes.dataMin, dataMax = extremes.dataMax, min = extremes.min, max = extremes.max, hoverPoints = chart.hoverPoints, closestPointRange = (xAxis.closestPointRange ||
                ((_a = xAxis.ordinal) === null || _a === void 0 ? void 0 : _a.overscrollPointsRange)), pointPixelWidth = (xAxis.translationSlope *
                (xAxis.ordinal.slope || closestPointRange)), 
            // How many ordinal units did we move?
            movedUnits = Math.round((mouseDownX - chartX) / pointPixelWidth), 
            // Get index of all the chart's points
            extendedOrdinalPositions = xAxis.ordinal.getExtendedPositions(), extendedAxis = {
                ordinal: {
                    positions: extendedOrdinalPositions,
                    extendedOrdinalPositions: extendedOrdinalPositions
                }
            }, index2val_1 = xAxis.index2val, val2lin_1 = xAxis.val2lin;
            var trimmedRange = void 0, ordinalPositions = void 0;
            // Make sure panning to the edges does not decrease the zoomed range
            if ((min <= dataMin && movedUnits < 0) ||
                (max + overscroll >= dataMax && movedUnits > 0)) {
                return;
            }
            // We have an ordinal axis, but the data is equally spaced
            if (!extendedAxis.ordinal.positions) {
                runBase = true;
            }
            else if (Math.abs(movedUnits) > 1) {
                // Remove active points for shared tooltip
                if (hoverPoints) {
                    hoverPoints.forEach(function (point) {
                        point.setState();
                    });
                }
                // In grouped data series, the last ordinal position represents
                // the grouped data, which is to the left of the real data max.
                // If we don't compensate for this, we will be allowed to pan
                // grouped data series passed the right of the plot area.
                ordinalPositions = extendedAxis.ordinal.positions;
                if (dataMax >
                    ordinalPositions[ordinalPositions.length - 1]) {
                    ordinalPositions.push(dataMax);
                }
                // Get the new min and max values by getting the ordinal index
                // for the current extreme, then add the moved units and
                // translate back to values. This happens on the extended
                // ordinal positions if the new position is out of range, else
                // it happens on the current x axis which is smaller and faster.
                chart.setFixedRange(max - min);
                trimmedRange = xAxis.navigatorAxis
                    .toFixedRange(void 0, void 0, index2val_1.apply(extendedAxis, [
                    val2lin_1.apply(extendedAxis, [min, true]) +
                        movedUnits
                ]), index2val_1.apply(extendedAxis, [
                    val2lin_1.apply(extendedAxis, [max, true]) +
                        movedUnits
                ]));
                // Apply it if it is within the available data range
                if (trimmedRange.min >= Math.min(ordinalPositions[0], min) &&
                    trimmedRange.max <= Math.max(ordinalPositions[ordinalPositions.length - 1], max) + overscroll) {
                    xAxis.setExtremes(trimmedRange.min, trimmedRange.max, true, false, { trigger: 'pan' });
                }
                chart.mouseDownX = chartX; // Set new reference for next run
                css(chart.container, { cursor: 'move' });
            }
        }
        else {
            runBase = true;
        }
        // Revert to the linear chart.pan version
        if (runBase || (panning && /y/.test(panning.type))) {
            if (overscroll) {
                xAxis.max = xAxis.dataMax + overscroll;
            }
        }
        else {
            e.preventDefault();
        }
    }
    /**
     * @private
     */
    function onSeriesUpdatedData() {
        var xAxis = this.xAxis;
        // Destroy the extended ordinal index on updated data
        // and destroy extendedOrdinalPositions, #16055.
        if (xAxis === null || xAxis === void 0 ? void 0 : xAxis.options.ordinal) {
            delete xAxis.ordinal.index;
            delete xAxis.ordinal.originalOrdinalRange;
        }
    }
    /**
     * Translate from a linear axis value to the corresponding ordinal axis
     * position. If there are no gaps in the ordinal axis this will be the
     * same. The translated value is the value that the point would have if
     * the axis was linear, using the same min and max.
     *
     * @private
     * @function Highcharts.Axis#val2lin
     * @param {number} val
     * The axis value.
     * @param {boolean} [toIndex]
     * Whether to return the index in the ordinalPositions or the new value.
     */
    function val2lin(val, toIndex) {
        var _a;
        var axis = this, ordinal = axis.ordinal, ordinalPositions = ordinal.positions;
        var slope = ordinal.slope, extendedOrdinalPositions;
        if (!ordinalPositions) {
            return val;
        }
        var ordinalLength = ordinalPositions.length;
        var ordinalIndex;
        // If the searched value is inside visible plotArea, ivastigate the
        // value basing on ordinalPositions.
        if (ordinalPositions[0] <= val &&
            ordinalPositions[ordinalLength - 1] >= val) {
            ordinalIndex = getIndexInArray(ordinalPositions, val);
            // Final return value is based on ordinalIndex
        }
        else {
            extendedOrdinalPositions = (_a = ordinal.getExtendedPositions) === null || _a === void 0 ? void 0 : _a.call(ordinal);
            if (!(extendedOrdinalPositions === null || extendedOrdinalPositions === void 0 ? void 0 : extendedOrdinalPositions.length)) {
                return val;
            }
            var length_2 = extendedOrdinalPositions.length;
            if (!slope) {
                slope =
                    (extendedOrdinalPositions[length_2 - 1] -
                        extendedOrdinalPositions[0]) /
                        length_2;
            }
            // `originalPointReference` is equal to the index of first point of
            // ordinalPositions in extendedOrdinalPositions.
            var originalPositionsReference = getIndexInArray(extendedOrdinalPositions, ordinalPositions[0]);
            // If the searched value is outside the visiblePlotArea,
            // check if it is inside extendedOrdinalPositions.
            if (val >= extendedOrdinalPositions[0] &&
                val <=
                    extendedOrdinalPositions[length_2 - 1]) {
                // Return Value
                ordinalIndex = getIndexInArray(extendedOrdinalPositions, val) -
                    originalPositionsReference;
            }
            else {
                if (!toIndex) {
                    // If the value is outside positions array,
                    // return initial value, #16784
                    return val;
                }
                // Since ordinal.slope is the average distance between 2
                // points on visible plotArea, this can be used to calculate
                // the approximate position of the point, which is outside
                // the extendedOrdinalPositions.
                if (val < extendedOrdinalPositions[0]) {
                    var diff = extendedOrdinalPositions[0] - val, approximateIndexOffset = diff / slope;
                    ordinalIndex =
                        -originalPositionsReference -
                            approximateIndexOffset;
                }
                else {
                    var diff = val -
                        extendedOrdinalPositions[length_2 - 1], approximateIndexOffset = diff / slope;
                    ordinalIndex =
                        approximateIndexOffset +
                            length_2 -
                            originalPositionsReference;
                }
            }
        }
        return toIndex ? ordinalIndex : slope * (ordinalIndex || 0) +
            ordinal.offset;
    }
    /* *
     *
     *  Classes
     *
     * */
    /**
     * @private
     */
    var Additions = /** @class */ (function () {
        /* *
         *
         *  Constructors
         *
         * */
        /**
         * @private
         */
        function Additions(axis) {
            this.index = {};
            this.axis = axis;
        }
        /* *
        *
        *  Functions
        *
        * */
        /**
         * Calculate the ordinal positions before tick positions are calculated.
         * @private
         */
        Additions.prototype.beforeSetTickPositions = function () {
            var _a;
            var axis = this.axis, ordinal = axis.ordinal, extremes = axis.getExtremes(), min = extremes.min, max = extremes.max, hasBreaks = (_a = axis.brokenAxis) === null || _a === void 0 ? void 0 : _a.hasBreaks, isOrdinal = axis.options.ordinal;
            var len, uniqueOrdinalPositions, dist, minIndex, maxIndex, slope, i, ordinalPositions = [], overscrollPointsRange = Number.MAX_VALUE, useOrdinal = false, adjustOrdinalExtremesPoints = false, isBoosted = false;
            // Apply the ordinal logic
            if (isOrdinal || hasBreaks) { // #4167 YAxis is never ordinal ?
                var distanceBetweenPoint_1 = 0;
                axis.series.forEach(function (series, i) {
                    var xData = series.getColumn('x', true);
                    uniqueOrdinalPositions = [];
                    // For an axis with multiple series, check if the distance
                    // between points is identical throughout all series.
                    if (i > 0 &&
                        series.options.id !== 'highcharts-navigator-series' &&
                        xData.length > 1) {
                        adjustOrdinalExtremesPoints = (distanceBetweenPoint_1 !== xData[1] - xData[0]);
                    }
                    distanceBetweenPoint_1 = xData[1] - xData[0];
                    if (series.boosted) {
                        isBoosted = series.boosted;
                    }
                    if (series.reserveSpace() &&
                        (series
                            .takeOrdinalPosition !== false || hasBreaks)) {
                        // Concatenate the processed X data into the existing
                        // positions, or the empty array
                        ordinalPositions = ordinalPositions.concat(xData);
                        len = ordinalPositions.length;
                        // Remove duplicates (#1588)
                        ordinalPositions.sort(function (a, b) {
                            // Without a custom function it is sorted as strings
                            return a - b;
                        });
                        overscrollPointsRange = Math.min(overscrollPointsRange, pick(
                        // Check for a single-point series:
                        series.closestPointRange, overscrollPointsRange));
                        if (len) {
                            i = 0;
                            while (i < len - 1) {
                                if (ordinalPositions[i] !==
                                    ordinalPositions[i + 1]) {
                                    uniqueOrdinalPositions.push(ordinalPositions[i + 1]);
                                }
                                i++;
                            }
                            // Check first item:
                            if (uniqueOrdinalPositions[0] !==
                                ordinalPositions[0]) {
                                uniqueOrdinalPositions.unshift(ordinalPositions[0]);
                            }
                            ordinalPositions = uniqueOrdinalPositions;
                        }
                    }
                });
                if (!axis.ordinal.originalOrdinalRange) {
                    // Calculate current originalOrdinalRange
                    axis.ordinal.originalOrdinalRange =
                        (ordinalPositions.length - 1) * overscrollPointsRange;
                }
                // If the distance between points is not identical throughout
                // all series, remove the first and last ordinal position to
                // avoid enabling ordinal logic when it is not needed, #17405.
                // Only for boosted series because changes are negligible.
                if (adjustOrdinalExtremesPoints && isBoosted) {
                    ordinalPositions.pop();
                    ordinalPositions.shift();
                }
                // Cache the length
                len = ordinalPositions.length;
                // Check if we really need the overhead of mapping axis data
                // against the ordinal positions. If the series consist of
                // evenly spaced data any way, we don't need any ordinal logic.
                if (len > 2) { // Two points have equal distance by default
                    dist = ordinalPositions[1] - ordinalPositions[0];
                    i = len - 1;
                    while (i-- && !useOrdinal) {
                        if (ordinalPositions[i + 1] - ordinalPositions[i] !==
                            dist) {
                            useOrdinal = true;
                        }
                    }
                    // When zooming in on a week, prevent axis padding for
                    // weekends even though the data within the week is evenly
                    // spaced.
                    if (!axis.options.keepOrdinalPadding &&
                        (ordinalPositions[0] - min > dist ||
                            (max -
                                ordinalPositions[ordinalPositions.length - 1]) > dist)) {
                        useOrdinal = true;
                    }
                }
                else if (axis.options.overscroll) {
                    if (len === 2) {
                        // Exactly two points, distance for overscroll is fixed:
                        overscrollPointsRange =
                            ordinalPositions[1] - ordinalPositions[0];
                    }
                    else if (len === 1) {
                        // We have just one point, closest distance is unknown.
                        // Assume then it is last point and overscrolled range:
                        overscrollPointsRange = axis.ordinal.convertOverscroll(axis.options.overscroll);
                        ordinalPositions = [
                            ordinalPositions[0],
                            ordinalPositions[0] + overscrollPointsRange
                        ];
                    }
                    else {
                        // In case of zooming in on overscrolled range, stick to
                        // the old range:
                        overscrollPointsRange = ordinal.overscrollPointsRange;
                    }
                }
                // Record the slope and offset to compute the linear values from
                // the array index. Since the ordinal positions may exceed the
                // current range, get the start and end positions within it
                // (#719, #665b)
                if (useOrdinal || axis.forceOrdinal) {
                    if (axis.options.overscroll) {
                        ordinal.overscrollPointsRange = overscrollPointsRange;
                        ordinalPositions = ordinalPositions.concat(ordinal.getOverscrollPositions());
                    }
                    // Register
                    ordinal.positions = ordinalPositions;
                    // This relies on the ordinalPositions being set. Use
                    // Math.max and Math.min to prevent padding on either sides
                    // of the data.
                    minIndex = axis.ordinal2lin(// #5979
                    Math.max(min, ordinalPositions[0]), true);
                    maxIndex = Math.max(axis.ordinal2lin(Math.min(max, ordinalPositions[ordinalPositions.length - 1]), true), 1); // #3339
                    // Set the slope and offset of the values compared to the
                    // indices in the ordinal positions.
                    ordinal.slope = slope =
                        (max - min) / (maxIndex - minIndex);
                    ordinal.offset = min - (minIndex * slope);
                }
                else {
                    ordinal.overscrollPointsRange = pick(axis.closestPointRange, ordinal.overscrollPointsRange);
                    ordinal.positions = axis.ordinal.slope = ordinal.offset =
                        void 0;
                }
            }
            axis.isOrdinal = isOrdinal && useOrdinal; // #3818, #4196, #4926
            ordinal.groupIntervalFactor = null; // Reset for next run
        };
        /**
         * Faster way of using the Array.indexOf method.
         * Works for sorted arrays only with unique values.
         *
         * @param {Array} sortedArray
         *        The sorted array inside which we are looking for.
         * @param {number} key
         *        The key to being found.
         * @param {boolean} indirectSearch
         *        In case of lack of the point in the array, should return
         *        value be equal to -1 or the closest smaller index.
         *  @private
         */
        Additions.findIndexOf = function (sortedArray, key, indirectSearch) {
            var start = 0, end = sortedArray.length - 1, middle;
            while (start < end) {
                middle = Math.ceil((start + end) / 2);
                // Key found as the middle element.
                if (sortedArray[middle] <= key) {
                    // Continue searching to the right.
                    start = middle;
                }
                else {
                    // Continue searching to the left.
                    end = middle - 1;
                }
            }
            if (sortedArray[start] === key) {
                return start;
            }
            // Key could not be found.
            return !indirectSearch ? -1 : start;
        };
        /**
         * Get the ordinal positions for the entire data set. This is necessary
         * in chart panning because we need to find out what points or data
         * groups are available outside the visible range. When a panning
         * operation starts, if an index for the given grouping does not exists,
         * it is created and cached. This index is deleted on updated data, so
         * it will be regenerated the next time a panning operation starts.
         * @private
         */
        Additions.prototype.getExtendedPositions = function (withOverscroll) {
            if (withOverscroll === void 0) { withOverscroll = true; }
            var ordinal = this, axis = ordinal.axis, axisProto = axis.constructor.prototype, chart = axis.chart, key = axis.series.reduce(function (k, series) {
                var grouping = series.currentDataGrouping;
                return (k +
                    (grouping ? grouping.count + grouping.unitName : 'raw'));
            }, ''), overscroll = withOverscroll ?
                axis.ordinal.convertOverscroll(axis.options.overscroll) : 0, extremes = axis.getExtremes();
            var fakeAxis, fakeSeries = void 0, ordinalIndex = ordinal.index;
            // If this is the first time, or the ordinal index is deleted by
            // updatedData,
            // create it.
            if (!ordinalIndex) {
                ordinalIndex = ordinal.index = {};
            }
            if (!ordinalIndex[key]) {
                // Create a fake axis object where the extended ordinal
                // positions are emulated
                fakeAxis = {
                    series: [],
                    chart: chart,
                    forceOrdinal: false,
                    getExtremes: function () {
                        return {
                            min: extremes.dataMin,
                            max: extremes.dataMax + overscroll
                        };
                    },
                    applyGrouping: axisProto.applyGrouping,
                    getGroupPixelWidth: axisProto.getGroupPixelWidth,
                    getTimeTicks: axisProto.getTimeTicks,
                    options: {
                        ordinal: true
                    },
                    ordinal: {
                        getGroupIntervalFactor: this.getGroupIntervalFactor
                    },
                    ordinal2lin: axisProto.ordinal2lin, // #6276
                    getIndexOfPoint: axisProto.getIndexOfPoint,
                    val2lin: axisProto.val2lin // #2590
                };
                fakeAxis.ordinal.axis = fakeAxis;
                // Add the fake series to hold the full data, then apply
                // processData to it
                axis.series.forEach(function (series) {
                    var _a, _b, _c;
                    fakeSeries = {
                        xAxis: fakeAxis,
                        chart: chart,
                        groupPixelWidth: series.groupPixelWidth,
                        destroyGroupedData: H.noop,
                        getColumn: series.getColumn,
                        applyGrouping: series.applyGrouping,
                        getProcessedData: series.getProcessedData,
                        reserveSpace: series.reserveSpace,
                        visible: series.visible
                    };
                    var xData = series.getColumn('x').concat(withOverscroll ?
                        ordinal.getOverscrollPositions() :
                        []);
                    fakeSeries.dataTable = new DataTableCore({
                        columns: {
                            x: xData
                        }
                    });
                    fakeSeries.options = __assign(__assign({}, series.options), { dataGrouping: series.currentDataGrouping ? {
                            firstAnchor: (_a = series.options.dataGrouping) === null || _a === void 0 ? void 0 : _a.firstAnchor,
                            anchor: (_b = series.options.dataGrouping) === null || _b === void 0 ? void 0 : _b.anchor,
                            lastAnchor: (_c = series.options.dataGrouping) === null || _c === void 0 ? void 0 : _c.firstAnchor,
                            enabled: true,
                            forced: true,
                            approximation: 'open',
                            units: [[
                                    series.currentDataGrouping.unitName,
                                    [series.currentDataGrouping.count]
                                ]]
                        } : {
                            enabled: false
                        } });
                    fakeAxis.series.push(fakeSeries);
                    series.processData.apply(fakeSeries);
                });
                fakeAxis.applyGrouping({ hasExtremesChanged: true });
                // Force to use the ordinal when points are evenly spaced (e.g.
                // weeks), #3825.
                if (((fakeSeries === null || fakeSeries === void 0 ? void 0 : fakeSeries.closestPointRange) !==
                    (fakeSeries === null || fakeSeries === void 0 ? void 0 : fakeSeries.basePointRange)) &&
                    fakeSeries.currentDataGrouping) {
                    fakeAxis.forceOrdinal = true;
                }
                // Run beforeSetTickPositions to compute the ordinalPositions
                axis.ordinal.beforeSetTickPositions.apply({ axis: fakeAxis });
                if (!axis.ordinal.originalOrdinalRange &&
                    fakeAxis.ordinal.originalOrdinalRange) {
                    axis.ordinal.originalOrdinalRange =
                        fakeAxis.ordinal.originalOrdinalRange;
                }
                // Cache it
                if (fakeAxis.ordinal.positions) {
                    ordinalIndex[key] = fakeAxis.ordinal.positions;
                }
            }
            return ordinalIndex[key];
        };
        /**
         * Find the factor to estimate how wide the plot area would have been if
         * ordinal gaps were included. This value is used to compute an imagined
         * plot width in order to establish the data grouping interval.
         *
         * A real world case is the intraday-candlestick example. Without this
         * logic, it would show the correct data grouping when viewing a range
         * within each day, but once moving the range to include the gap between
         * two days, the interval would include the cut-away night hours and the
         * data grouping would be wrong. So the below method tries to compensate
         * by identifying the most common point interval, in this case days.
         *
         * An opposite case is presented in issue #718. We have a long array of
         * daily data, then one point is appended one hour after the last point.
         * We expect the data grouping not to change.
         *
         * In the future, if we find cases where this estimation doesn't work
         * optimally, we might need to add a second pass to the data grouping
         * logic, where we do another run with a greater interval if the number
         * of data groups is more than a certain fraction of the desired group
         * count.
         * @private
         */
        Additions.prototype.getGroupIntervalFactor = function (xMin, xMax, series) {
            var ordinal = this, processedXData = series.getColumn('x', true), len = processedXData.length, distances = [];
            var median, i, groupIntervalFactor = ordinal.groupIntervalFactor;
            // Only do this computation for the first series, let the other
            // inherit it (#2416)
            if (!groupIntervalFactor) {
                // Register all the distances in an array
                for (i = 0; i < len - 1; i++) {
                    distances[i] = (processedXData[i + 1] -
                        processedXData[i]);
                }
                // Sort them and find the median
                distances.sort(function (a, b) {
                    return a - b;
                });
                median = distances[Math.floor(len / 2)];
                // Compensate for series that don't extend through the entire
                // axis extent. #1675.
                xMin = Math.max(xMin, processedXData[0]);
                xMax = Math.min(xMax, processedXData[len - 1]);
                ordinal.groupIntervalFactor = groupIntervalFactor =
                    (len * median) / (xMax - xMin);
            }
            // Return the factor needed for data grouping
            return groupIntervalFactor;
        };
        /**
         * Get index of point inside the ordinal positions array.
         *
         * @private
         * @param {number} pixelVal
         * The pixel value of a point.
         *
         * @param {Array<number>} [ordinalArray]
         * An array of all points available on the axis for the given data set.
         * Either ordinalPositions if the value is inside the plotArea or
         * extendedOrdinalPositions if not.
         */
        Additions.prototype.getIndexOfPoint = function (pixelVal, ordinalArray) {
            var ordinal = this, axis = ordinal.axis, min = axis.min, minX = axis.minPixelPadding, indexOfMin = getIndexInArray(ordinalArray, min);
            var ordinalPointPixelInterval = axis.translationSlope *
                (ordinal.slope ||
                    axis.closestPointRange ||
                    ordinal.overscrollPointsRange);
            var shiftIndex = correctFloat((pixelVal - minX) / ordinalPointPixelInterval);
            return indexOfMin + shiftIndex;
        };
        /**
         * Get ticks for an ordinal axis within a range where points don't
         * exist. It is required when overscroll is enabled. We can't base on
         * points, because we may not have any, so we use approximated
         * pointRange and generate these ticks between Axis.dataMax,
         * Axis.dataMax + Axis.overscroll evenly spaced. Used in panning and
         * navigator scrolling.
         * @private
         */
        Additions.prototype.getOverscrollPositions = function () {
            var ordinal = this, axis = ordinal.axis, extraRange = ordinal.convertOverscroll(axis.options.overscroll), distance = ordinal.overscrollPointsRange, positions = [];
            var max = axis.dataMax;
            if (defined(distance)) {
                // Max + pointRange because we need to scroll to the last
                while (max < axis.dataMax + extraRange) {
                    max += distance;
                    positions.push(max);
                }
            }
            return positions;
        };
        /**
         * Make the tick intervals closer because the ordinal gaps make the
         * ticks spread out or cluster.
         * @private
         */
        Additions.prototype.postProcessTickInterval = function (tickInterval) {
            // Problem: https://jsfiddle.net/highcharts/FQm4E/1/. This is a case
            // where this algorithm doesn't work optimally. In this case, the
            // tick labels are spread out per week, but all the gaps reside
            // within weeks. So we have a situation where the labels are courser
            // than the ordinal gaps, and thus the tick interval should not be
            // altered.
            var ordinal = this, axis = ordinal.axis, ordinalSlope = ordinal.slope, closestPointRange = axis.closestPointRange;
            var ret;
            if (ordinalSlope && closestPointRange) {
                if (!axis.options.breaks) {
                    ret = (tickInterval /
                        (ordinalSlope / closestPointRange));
                }
                else {
                    ret = closestPointRange || tickInterval; // #7275
                }
            }
            else {
                ret = tickInterval;
            }
            return ret;
        };
        /**
         * If overscroll is pixel or percentage value, convert it to axis range.
         *
         * @private
         * @param {number | string} overscroll
         * Overscroll value in axis range, pixels or percentage value.
         * @return {number}
         * Overscroll value in axis range.
         */
        Additions.prototype.convertOverscroll = function (overscroll) {
            if (overscroll === void 0) { overscroll = 0; }
            var ordinal = this, axis = ordinal.axis, calculateOverscroll = function (overscrollPercentage) {
                return pick(ordinal.originalOrdinalRange, defined(axis.dataMax) && defined(axis.dataMin) ?
                    axis.dataMax - axis.dataMin : 0) * overscrollPercentage;
            };
            if (isString(overscroll)) {
                var overscrollValue = parseInt(overscroll, 10);
                var isFullRange = void 0;
                // #22334
                if (defined(axis.min) && defined(axis.max) &&
                    defined(axis.dataMin) && defined(axis.dataMax)) {
                    isFullRange =
                        axis.max - axis.min === axis.dataMax - axis.dataMin;
                    if (!isFullRange) {
                        this.originalOrdinalRange = axis.max - axis.min;
                    }
                }
                if (/%$/.test(overscroll)) {
                    // If overscroll is percentage
                    return calculateOverscroll(overscrollValue / 100);
                }
                if (/px/.test(overscroll)) {
                    // If overscroll is pixels, it is limited to 90% of the axis
                    // length to prevent division by zero
                    var limitedOverscrollValue = Math.min(overscrollValue, axis.len * 0.9), pixelToPercent = limitedOverscrollValue / axis.len;
                    return calculateOverscroll(pixelToPercent /
                        (isFullRange ? (1 - pixelToPercent) : 1));
                }
                // If overscroll is a string but not pixels or percentage,
                // return 0 as no overscroll
                return 0;
            }
            return overscroll;
        };
        return Additions;
    }());
    OrdinalAxis.Additions = Additions;
})(OrdinalAxis || (OrdinalAxis = {}));
/* *
 *
 *  Default Export
 *
 * */
export default OrdinalAxis;
