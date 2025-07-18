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
 * Creates the mode map of the given arguments.
 *
 * @private
 * @function Formula.processorFunctions.MULT
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
function getModeMap(args, table) {
    var modeMap = {}, values = FormulaProcessor.getArgumentsValues(args, table);
    for (var i = 0, iEnd = values.length, value = void 0; i < iEnd; ++i) {
        value = values[i];
        switch (typeof value) {
            case 'number':
                if (!isNaN(value)) {
                    modeMap[value] = (modeMap[value] || 0) + 1;
                }
                break;
            case 'object':
                for (var j = 0, jEnd = value.length, value2 = void 0; j < jEnd; ++j) {
                    value2 = value[j];
                    if (typeof value2 === 'number' &&
                        !isNaN(value2)) {
                        modeMap[value2] = (modeMap[value2] || 0) + 1;
                    }
                }
                break;
        }
    }
    return modeMap;
}
/**
 * Processor for the `MODE.MULT(...values)` implementation. Calculates the most
 * frequent values of the give values.
 *
 * @private
 * @function Formula.processorFunctions.MULT
 *
 * @param {Highcharts.FormulaArguments} args
 * Arguments to process.
 *
 * @param {Highcharts.DataTable} [table]
 * Table to process.
 *
 * @return {number|Array<number>}
 * Result value of the process.
 */
function MULT(args, table) {
    var modeMap = getModeMap(args, table), keys = Object.keys(modeMap);
    if (!keys.length) {
        return NaN;
    }
    var modeKeys = [parseFloat(keys[0])], modeCount = modeMap[keys[0]];
    for (var i = 1, iEnd = keys.length, key = void 0, count = void 0; i < iEnd; ++i) {
        key = keys[i];
        count = modeMap[key];
        if (modeCount < count) {
            modeKeys = [parseFloat(key)];
            modeCount = count;
        }
        else if (modeCount === count) {
            modeKeys.push(parseFloat(key));
        }
    }
    return modeCount > 1 ? modeKeys : NaN;
}
/**
 * Processor for the `MODE.SNGL(...values)` implementation. Calculates the
 * lowest most frequent value of the give values.
 *
 * @private
 * @function Formula.processorFunctions['MODE.SNGL']
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
function SNGL(args, table) {
    var modeMap = getModeMap(args, table), keys = Object.keys(modeMap);
    if (!keys.length) {
        return NaN;
    }
    var modeKey = parseFloat(keys[0]), modeCount = modeMap[keys[0]];
    for (var i = 1, iEnd = keys.length, key = void 0, keyValue = void 0, count = void 0; i < iEnd; ++i) {
        key = keys[i];
        count = modeMap[key];
        if (modeCount < count) {
            modeKey = parseFloat(key);
            modeCount = count;
        }
        else if (modeCount === count) {
            keyValue = parseFloat(key);
            if (modeKey > keyValue) {
                modeKey = keyValue;
                modeCount = count;
            }
        }
    }
    return modeCount > 1 ? modeKey : NaN;
}
/* *
 *
 *  Registry
 *
 * */
FormulaProcessor.registerProcessorFunction('MODE', SNGL);
FormulaProcessor.registerProcessorFunction('MODE.MULT', MULT);
FormulaProcessor.registerProcessorFunction('MODE.SNGL', SNGL);
/* *
 *
 *  Default Export
 *
 * */
var MODE = {
    MULT: MULT,
    SNGL: SNGL
};
export default MODE;
