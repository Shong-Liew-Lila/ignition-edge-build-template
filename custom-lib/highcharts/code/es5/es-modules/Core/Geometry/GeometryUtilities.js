/* *
 *
 *  (c) 2010-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
/* *
 *
 *  Namespace
 *
 * */
var GeometryUtilities;
(function (GeometryUtilities) {
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Calculates the center between a list of points.
     *
     * @private
     *
     * @param {Array<Highcharts.PositionObject>} points
     * A list of points to calculate the center of.
     *
     * @return {Highcharts.PositionObject}
     * Calculated center
     */
    function getCenterOfPoints(points) {
        var sum = points.reduce(function (sum, point) {
            sum.x += point.x;
            sum.y += point.y;
            return sum;
        }, { x: 0, y: 0 });
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }
    GeometryUtilities.getCenterOfPoints = getCenterOfPoints;
    /**
     * Calculates the distance between two points based on their x and y
     * coordinates.
     *
     * @private
     *
     * @param {Highcharts.PositionObject} p1
     * The x and y coordinates of the first point.
     *
     * @param {Highcharts.PositionObject} p2
     * The x and y coordinates of the second point.
     *
     * @return {number}
     * Returns the distance between the points.
     */
    function getDistanceBetweenPoints(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    GeometryUtilities.getDistanceBetweenPoints = getDistanceBetweenPoints;
    /**
     * Calculates the angle between two points.
     * @todo add unit tests.
     * @private
     * @param {Highcharts.PositionObject} p1 The first point.
     * @param {Highcharts.PositionObject} p2 The second point.
     * @return {number} Returns the angle in radians.
     */
    function getAngleBetweenPoints(p1, p2) {
        return Math.atan2(p2.x - p1.x, p2.y - p1.y);
    }
    GeometryUtilities.getAngleBetweenPoints = getAngleBetweenPoints;
    /**
     * Test for point in polygon. Polygon defined as array of [x,y] points.
     * @private
     * @param {PositionObject} point The point potentially within a polygon.
     * @param {Array<Array<number>>} polygon The polygon potentially containing the point.
     */
    function pointInPolygon(_a, polygon) {
        var x = _a.x, y = _a.y;
        var len = polygon.length;
        var i, j, inside = false;
        for (i = 0, j = len - 1; i < len; j = i++) {
            var _b = polygon[i], x1 = _b[0], y1 = _b[1], _c = polygon[j], x2 = _c[0], y2 = _c[1];
            if (y1 > y !== y2 > y &&
                (x < (x2 - x1) *
                    (y - y1) /
                    (y2 - y1) +
                    x1)) {
                inside = !inside;
            }
        }
        return inside;
    }
    GeometryUtilities.pointInPolygon = pointInPolygon;
})(GeometryUtilities || (GeometryUtilities = {}));
/* *
 *
 *  Default Export
 *
 * */
export default GeometryUtilities;
