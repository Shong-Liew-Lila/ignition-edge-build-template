/**
 * @license Highcharts JS v@product.version@ (@product.date@)
 * @module highcharts/modules/series-label
 * @requires highcharts
 *
 * (c) 2009-2025 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import Highcharts from '../../Core/Globals.js';
import SeriesLabel from '../../Extensions/SeriesLabel/SeriesLabel.js';
var G = Highcharts;
SeriesLabel.compose(G.Chart, G.SVGRenderer);
export default Highcharts;
