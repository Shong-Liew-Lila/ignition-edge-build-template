/* *
 *
 *  (c) 2009-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *
 * */
'use strict';
import FormulaProcessor from '../FormulaProcessor.js';
var getArgumentValue = FormulaProcessor.getArgumentValue;
/* *
 *
 *  Functions
 *
 * */
/**
 * Processor for the `AVERAGEA(...values)` implementation. Calculates the
 * average of the given values. Strings and FALSE are calculated as 0.
 *
 * @private
 * @function Formula.processorFunctions.AVERAGEA
 *
 * @param {Highcharts.FormulaArguments} args
 * Arguments to process.
 *
 * @param {Highcharts.DataTable} [table]
 * Table to use for references and ranges.
 *
 * @return {number}
 * Result value of the process.
 */
function AVERAGEA(args, table) {
    var count = 0, result = 0;
    for (var i = 0, iEnd = args.length, value = void 0; i < iEnd; ++i) {
        value = getArgumentValue(args[i], table);
        switch (typeof value) {
            case 'boolean':
                ++count;
                result += (value ? 1 : 0);
                continue;
            case 'number':
                if (!isNaN(value)) {
                    ++count;
                    result += value;
                }
                continue;
            case 'string':
                ++count;
                continue;
            default:
                for (var j = 0, jEnd = value.length, value2 = void 0; j < jEnd; ++j) {
                    value2 = value[j];
                    switch (typeof value2) {
                        case 'boolean':
                            ++count;
                            result += (value2 ? 1 : 0);
                            continue;
                        case 'number':
                            if (!isNaN(value2)) {
                                ++count;
                                result += value2;
                            }
                            continue;
                        case 'string':
                            ++count;
                            continue;
                    }
                }
                continue;
        }
    }
    return (count ? (result / count) : 0);
}
/* *
 *
 *  Registry
 *
 * */
FormulaProcessor.registerProcessorFunction('AVERAGEA', AVERAGEA);
/* *
 *
 *  Default Export
 *
 * */
export default AVERAGEA;
