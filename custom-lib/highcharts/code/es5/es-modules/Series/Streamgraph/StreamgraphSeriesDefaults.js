/* *
 *
 *  Streamgraph module
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
/* *
 *
 *  API Options
 *
 * */
/**
 * A streamgraph is a type of stacked area graph which is displaced around a
 * central axis, resulting in a flowing, organic shape.
 *
 * @sample {highcharts|highstock} highcharts/demo/streamgraph/
 *         Streamgraph
 *
 * @extends      plotOptions.areaspline
 * @since        6.0.0
 * @product      highcharts highstock
 * @requires     modules/streamgraph
 * @optionparent plotOptions.streamgraph
 */
var StreamgraphSeriesDefaults = {
    /**
     * @see [fillColor](#plotOptions.streamgraph.fillColor)
     * @see [fillOpacity](#plotOptions.streamgraph.fillOpacity)
     *
     * @apioption plotOptions.streamgraph.color
     */
    /**
     * @see [color](#plotOptions.streamgraph.color)
     * @see [fillOpacity](#plotOptions.streamgraph.fillOpacity)
     *
     * @apioption plotOptions.streamgraph.fillColor
     */
    /**
     * @see [color](#plotOptions.streamgraph.color)
     * @see [fillColor](#plotOptions.streamgraph.fillColor)
     *
     * @apioption plotOptions.streamgraph.fillOpacity
     */
    fillOpacity: 1,
    lineWidth: 0,
    marker: {
        enabled: false
    },
    stacking: 'stream'
};
/**
 * A `streamgraph` series. If the [type](#series.streamgraph.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.streamgraph
 * @excluding dataParser, dataURL, step, boostThreshold, boostBlending
 * @product   highcharts highstock
 * @requires  modules/streamgraph
 * @apioption series.streamgraph
 */
/**
 * @see [fillColor](#series.streamgraph.fillColor)
 * @see [fillOpacity](#series.streamgraph.fillOpacity)
 *
 * @apioption series.streamgraph.color
 */
/**
 * An array of data points for the series. For the `streamgraph` series type,
 * points can be given in the following ways:
 *
 * 1. An array of numerical values. In this case, the numerical values will be
 *    interpreted as `y` options. The `x` values will be automatically
 *    calculated, either starting at 0 and incremented by 1, or from
 *    `pointStart` and `pointInterval` given in the series options. If the axis
 *    has categories, these will be used. Example:
 *    ```js
 *    data: [0, 5, 3, 5]
 *    ```
 *
 * 2. An array of arrays with 2 values. In this case, the values correspond to
 *    `x,y`. If the first value is a string, it is applied as the name of the
 *    point, and the `x` value is inferred.
 *    ```js
 *        data: [
 *            [0, 9],
 *            [1, 7],
 *            [2, 6]
 *        ]
 *    ```
 *
 * 3. An array of objects with named values. The following snippet shows only a
 *    few settings, see the complete options set below. If the total number of
 *    data points exceeds the series'
 *    [turboThreshold](#series.area.turboThreshold),
 *    this option is not available.
 *    ```js
 *        data: [{
 *            x: 1,
 *            y: 9,
 *            name: "Point2",
 *            color: "#00FF00"
 *        }, {
 *            x: 1,
 *            y: 6,
 *            name: "Point1",
 *            color: "#FF00FF"
 *        }]
 *    ```
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-arrays/
 *         Arrays of numeric x and y
 * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *         Arrays of datetime x and y
 * @sample {highcharts} highcharts/series/data-array-of-name-value/
 *         Arrays of point.name and y
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|Array<(number|string),(number|null)>|null|*>}
 * @extends   series.line.data
 * @product   highcharts highstock
 * @apioption series.streamgraph.data
 */
/**
 * @see [color](#series.streamgraph.color)
 * @see [fillOpacity](#series.streamgraph.fillOpacity)
 *
 * @apioption series.streamgraph.fillColor
 */
/**
 * @see [color](#series.streamgraph.color)
 * @see [fillColor](#series.streamgraph.fillColor)
 *
 * @type      {number}
 * @default   1
 * @apioption series.streamgraph.fillOpacity
 */
''; // Keeps doclets above separate
/* *
 *
 *  Default Export
 *
 * */
export default StreamgraphSeriesDefaults;
