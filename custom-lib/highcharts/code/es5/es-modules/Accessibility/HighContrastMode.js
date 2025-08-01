/* *
 *
 *  (c) 2009-2025 Øystein Moseng
 *
 *  Handling for Windows High Contrast Mode.
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import H from '../Core/Globals.js';
var doc = H.doc, isMS = H.isMS, win = H.win;
/* *
 *
 *  Functions
 *
 * */
/**
 * Detect WHCM in the browser.
 *
 * @function Highcharts#isHighContrastModeActive
 * @private
 * @return {boolean} Returns true if the browser is in High Contrast mode.
 */
function isHighContrastModeActive() {
    // Use media query on Edge, but not on IE
    var isEdge = /(Edg)/.test(win.navigator.userAgent);
    if (win.matchMedia && isEdge) {
        return win.matchMedia('(-ms-high-contrast: active)').matches;
    }
    // Test BG image for IE
    if (isMS && win.getComputedStyle) {
        var testDiv = doc.createElement('div');
        var imageSrc = 'data:image/gif;base64,' +
            'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        testDiv.style.backgroundImage = "url(".concat(imageSrc, ")"); // #13071
        doc.body.appendChild(testDiv);
        var bi = (testDiv.currentStyle ||
            win.getComputedStyle(testDiv)).backgroundImage;
        doc.body.removeChild(testDiv);
        return bi === 'none';
    }
    // Other browsers use the forced-colors standard
    return win.matchMedia && win.matchMedia('(forced-colors: active)').matches;
}
/**
 * Force high contrast theme for the chart. The default theme is defined in
 * a separate file.
 *
 * @function Highcharts#setHighContrastTheme
 * @private
 * @param {Highcharts.AccessibilityChart} chart The chart to set the theme of.
 * @return {void}
 */
function setHighContrastTheme(chart) {
    // We might want to add additional functionality here in the future for
    // storing the old state so that we can reset the theme if HC mode is
    // disabled. For now, the user will have to reload the page.
    var _a;
    chart.highContrastModeActive = true;
    // Apply theme to chart
    var theme = (chart.options.accessibility.highContrastTheme);
    chart.update(theme, false);
    var hasCustomColors = ((_a = theme.colors) === null || _a === void 0 ? void 0 : _a.length) > 1;
    // Force series colors (plotOptions is not enough)
    chart.series.forEach(function (s) {
        var plotOpts = theme.plotOptions[s.type] || {};
        var fillColor = hasCustomColors && s.colorIndex !== void 0 ?
            theme.colors[s.colorIndex] :
            plotOpts.color || 'window';
        var seriesOptions = {
            color: plotOpts.color || 'windowText',
            colors: hasCustomColors ?
                theme.colors : [plotOpts.color || 'windowText'],
            borderColor: plotOpts.borderColor || 'window',
            fillColor: fillColor
        };
        s.update(seriesOptions, false);
        if (s.points) {
            // Force point colors if existing
            s.points.forEach(function (p) {
                if (p.options && p.options.color) {
                    p.update({
                        color: plotOpts.color || 'windowText',
                        borderColor: plotOpts.borderColor || 'window'
                    }, false);
                }
            });
        }
    });
    // The redraw for each series and after is required for 3D pie
    // (workaround)
    chart.redraw();
}
/* *
 *
 *  Default Export
 *
 * */
var whcm = {
    isHighContrastModeActive: isHighContrastModeActive,
    setHighContrastTheme: setHighContrastTheme
};
export default whcm;
