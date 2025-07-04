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
import DataGroupingDefaults from './DataGroupingDefaults.js';
import U from '../../Core/Utilities.js';
var addEvent = U.addEvent, extend = U.extend, merge = U.merge, pick = U.pick;
/* *
 *
 *  Variables
 *
 * */
var AxisConstructor;
/* *
 *
 *  Functions
 *
 * */
/**
 * Check the groupPixelWidth and apply the grouping if needed.
 * Fired only after processing the data.
 *
 * @product highstock
 *
 * @function Highcharts.Axis#applyGrouping
 */
function applyGrouping(e) {
    var axis = this, series = axis.series;
    // Reset the groupPixelWidth for all series, #17141.
    series.forEach(function (series) {
        series.groupPixelWidth = void 0; // #2110
    });
    series.forEach(function (series) {
        series.groupPixelWidth = (axis.getGroupPixelWidth &&
            axis.getGroupPixelWidth());
        if (series.groupPixelWidth) {
            series.hasProcessed = true; // #2692
        }
        // Fire independing on series.groupPixelWidth to always set a proper
        // dataGrouping state, (#16238)
        series.applyGrouping(!!e.hasExtremesChanged);
    });
}
/**
 * @private
 */
function compose(AxisClass) {
    AxisConstructor = AxisClass;
    var axisProto = AxisClass.prototype;
    if (!axisProto.applyGrouping) {
        addEvent(AxisClass, 'afterSetScale', onAfterSetScale);
        // When all series are processed, calculate the group pixel width and
        // then if this value is different than zero apply groupings.
        addEvent(AxisClass, 'postProcessData', applyGrouping);
        extend(axisProto, {
            applyGrouping: applyGrouping,
            getGroupPixelWidth: getGroupPixelWidth,
            setDataGrouping: setDataGrouping
        });
    }
}
/**
 * Get the data grouping pixel width based on the greatest defined individual
 * width of the axis' series, and if whether one of the axes need grouping.
 * @private
 */
function getGroupPixelWidth() {
    var series = this.series;
    var i = series.length, groupPixelWidth = 0, doGrouping = false, dataLength, dgOptions;
    // If one of the series needs grouping, apply it to all (#1634)
    while (i--) {
        dgOptions = series[i].options.dataGrouping;
        if (dgOptions) { // #2692
            // If multiple series are compared on the same x axis, give them the
            // same group pixel width (#334)
            groupPixelWidth = Math.max(groupPixelWidth, 
            // Fallback to commonOptions (#9693)
            pick(dgOptions.groupPixelWidth, DataGroupingDefaults.common.groupPixelWidth));
            dataLength = (series[i].dataTable.modified ||
                series[i].dataTable).rowCount;
            // Execute grouping if the amount of points is greater than the
            // limit defined in groupPixelWidth
            if (series[i].groupPixelWidth ||
                (dataLength >
                    (this.chart.plotSizeX / groupPixelWidth)) ||
                (dataLength && dgOptions.forced)) {
                doGrouping = true;
            }
        }
    }
    return doGrouping ? groupPixelWidth : 0;
}
/**
 * When resetting the scale reset the hasProcessed flag to avoid taking
 * previous data grouping of neighbour series into account when determining
 * group pixel width (#2692).
 * @private
 */
function onAfterSetScale() {
    this.series.forEach(function (series) {
        series.hasProcessed = false;
    });
}
/**
 * Highcharts Stock only. Force data grouping on all the axis' series.
 *
 * @product highstock
 *
 * @function Highcharts.Axis#setDataGrouping
 *
 * @param {boolean|Highcharts.DataGroupingOptionsObject} [dataGrouping]
 *        A `dataGrouping` configuration. Use `false` to disable data grouping
 *        dynamically.
 *
 * @param {boolean} [redraw=true]
 *        Whether to redraw the chart or wait for a later call to
 *        {@link Chart#redraw}.
 */
function setDataGrouping(dataGrouping, redraw) {
    var axis = this;
    var i;
    redraw = pick(redraw, true);
    if (!dataGrouping) {
        dataGrouping = {
            forced: false,
            units: null
        };
    }
    // Axis is instantiated, update all series
    if (this instanceof AxisConstructor) {
        i = this.series.length;
        while (i--) {
            this.series[i].update({
                dataGrouping: dataGrouping
            }, false);
        }
        // Axis not yet instantiated, alter series options
    }
    else {
        this.chart.options.series.forEach(function (seriesOptions) {
            // Merging dataGrouping options with already defined options #16759
            seriesOptions.dataGrouping = typeof dataGrouping === 'boolean' ?
                dataGrouping :
                merge(dataGrouping, seriesOptions.dataGrouping);
        });
    }
    // Clear ordinal slope, so we won't accidentally use the old one (#7827)
    if (axis.ordinal) {
        axis.ordinal.slope = void 0;
    }
    if (redraw) {
        this.chart.redraw();
    }
}
/* *
 *
 *  Default Export
 *
 * */
var DataGroupingAxisComposition = {
    compose: compose
};
export default DataGroupingAxisComposition;
