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
/* *
 *
 *  Functions
 *
 * */
/**
 * Processor for the `SUM(...values)` implementation. Calculates the sum of the
 * given values.
 *
 * @private
 * @function Formula.processorFunctions.SUM
 *
 * @param {Highcharts.FormulaArguments} args
 * Arguments to process.
 *
 * @param {Highcharts.DataTable} [table]
 * Table to process.
 *
 * @return {number}
 * Result value of the process.
 */
function SUM(args, table) {
    var values = FormulaProcessor.getArgumentsValues(args, table);
    var result = 0;
    for (var i = 0, iEnd = values.length, value = void 0; i < iEnd; ++i) {
        value = values[i];
        switch (typeof value) {
            case 'number':
                if (!isNaN(value)) {
                    result += value;
                }
                break;
            case 'object':
                result += SUM(value, table);
                break;
        }
    }
    return result;
}
/* *
 *
 *  Registry
 *
 * */
FormulaProcessor.registerProcessorFunction('SUM', SUM); // 🐝
/* *
 *
 *  Default Export
 *
 * */
export default SUM;
