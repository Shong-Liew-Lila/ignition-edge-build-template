/**
 * @license Highcharts Gantt JS v@product.version@ (@product.date@)
 * @module highcharts/modules/treegrid
 * @requires highcharts
 *
 * Tree Grid
 *
 * (c) 2016-2025 Jon Arild Nygard
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import TreeGridAxis from '../../Core/Axis/TreeGrid/TreeGridAxis.js';
var G = Highcharts;
TreeGridAxis.compose(G.Axis, G.Chart, G.Series, G.Tick);
export default Highcharts;
