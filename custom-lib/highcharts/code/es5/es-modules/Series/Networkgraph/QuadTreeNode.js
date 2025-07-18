/* *
 *
 *  Networkgraph series
 *
 *  (c) 2010-2025 Paweł Fus
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
/* *
 *
 *  Class
 *
 * */
/**
 * The QuadTree node class. Used in Networkgraph chart as a base for Barnes-Hut
 * approximation.
 *
 * @private
 * @class
 * @name Highcharts.QuadTreeNode
 *
 * @param {Highcharts.Dictionary<number>} box
 *        Available space for the node
 */
var QuadTreeNode = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    function QuadTreeNode(box) {
        /* *
         *
         *  Properties
         *
         * */
        /**
         * Read only. If QuadTreeNode is an external node, Point is stored in
         * `this.body`.
         *
         * @name Highcharts.QuadTreeNode#body
         * @type {boolean|Highcharts.Point}
         */
        this.body = false;
        /**
         * Read only. Internal nodes when created are empty to reserve the
         * space. If Point is added to this QuadTreeNode, QuadTreeNode is no
         * longer empty.
         *
         * @name Highcharts.QuadTreeNode#isEmpty
         * @type {boolean}
         */
        this.isEmpty = false;
        /**
         * Read only. Flag to determine if QuadTreeNode is internal (and has
         * subnodes with mass and central position) or external (bound to
         * Point).
         *
         * @name Highcharts.QuadTreeNode#isInternal
         * @type {boolean}
         */
        this.isInternal = false;
        /**
         * Read only. Array of subnodes. Empty if QuadTreeNode has just one
         * Point. When added another Point to this QuadTreeNode, array is
         * filled with four subnodes.
         *
         * @name Highcharts.QuadTreeNode#nodes
         * @type {Array<Highcharts.QuadTreeNode>}
         */
        this.nodes = [];
        /**
         * Read only. The available space for node.
         *
         * @name Highcharts.QuadTreeNode#box
         * @type {Highcharts.Dictionary<number>}
         */
        this.box = box;
        /**
         * Read only. The minium of width and height values.
         *
         * @name Highcharts.QuadTreeNode#boxSize
         * @type {number}
         */
        this.boxSize = Math.min(box.width, box.height);
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * When inserting another node into the box, that already hove one node,
     * divide the available space into another four quadrants.
     *
     * Indexes of quadrants are:
     * ```
     * -------------               -------------
     * |           |               |     |     |
     * |           |               |  0  |  1  |
     * |           |   divide()    |     |     |
     * |     1     | ----------->  -------------
     * |           |               |     |     |
     * |           |               |  3  |  2  |
     * |           |               |     |     |
     * -------------               -------------
     * ```
     */
    QuadTreeNode.prototype.divideBox = function () {
        var halfWidth = this.box.width / 2, halfHeight = this.box.height / 2;
        // Top left
        this.nodes[0] = new QuadTreeNode({
            left: this.box.left,
            top: this.box.top,
            width: halfWidth,
            height: halfHeight
        });
        // Top right
        this.nodes[1] = new QuadTreeNode({
            left: this.box.left + halfWidth,
            top: this.box.top,
            width: halfWidth,
            height: halfHeight
        });
        // Bottom right
        this.nodes[2] = new QuadTreeNode({
            left: this.box.left + halfWidth,
            top: this.box.top + halfHeight,
            width: halfWidth,
            height: halfHeight
        });
        // Bottom left
        this.nodes[3] = new QuadTreeNode({
            left: this.box.left,
            top: this.box.top + halfHeight,
            width: halfWidth,
            height: halfHeight
        });
    };
    /**
     * Determine which of the quadrants should be used when placing node in
     * the QuadTree. Returned index is always in range `< 0 , 3 >`.
     * @private
     */
    QuadTreeNode.prototype.getBoxPosition = function (point) {
        var left = point.plotX < this.box.left + this.box.width / 2, top = point.plotY < this.box.top + this.box.height / 2;
        var index;
        if (left) {
            if (top) {
                // Top left
                index = 0;
            }
            else {
                // Bottom left
                index = 3;
            }
        }
        else {
            if (top) {
                // Top right
                index = 1;
            }
            else {
                // Bottom right
                index = 2;
            }
        }
        return index;
    };
    /**
     * Insert recursively point(node) into the QuadTree. If the given
     * quadrant is already occupied, divide it into smaller quadrants.
     *
     * @param {Highcharts.Point} point
     *        Point/node to be inserted
     * @param {number} depth
     *        Max depth of the QuadTree
     */
    QuadTreeNode.prototype.insert = function (point, depth) {
        var newQuadTreeNode;
        if (this.isInternal) {
            // Internal node:
            this.nodes[this.getBoxPosition(point)].insert(point, depth - 1);
        }
        else {
            this.isEmpty = false;
            if (!this.body) {
                // First body in a quadrant:
                this.isInternal = false;
                this.body = point;
            }
            else {
                if (depth) {
                    // Every other body in a quadrant:
                    this.isInternal = true;
                    this.divideBox();
                    // Reinsert main body only once:
                    if (this.body !== true) {
                        this.nodes[this.getBoxPosition(this.body)]
                            .insert(this.body, depth - 1);
                        this.body = true;
                    }
                    // Add second body:
                    this.nodes[this.getBoxPosition(point)]
                        .insert(point, depth - 1);
                }
                else {
                    // We are below max allowed depth. That means either:
                    // - really huge number of points
                    // - falling two points into exactly the same position
                    // In this case, create another node in the QuadTree.
                    //
                    // Alternatively we could add some noise to the
                    // position, but that could result in different
                    // rendered chart in exporting.
                    newQuadTreeNode = new QuadTreeNode({
                        top: point.plotX || NaN,
                        left: point.plotY || NaN,
                        // Width/height below 1px
                        width: 0.1,
                        height: 0.1
                    });
                    newQuadTreeNode.body = point;
                    newQuadTreeNode.isInternal = false;
                    this.nodes.push(newQuadTreeNode);
                }
            }
        }
    };
    /**
     * Each quad node requires it's mass and center position. That mass and
     * position is used to imitate real node in the layout by approximation.
     */
    QuadTreeNode.prototype.updateMassAndCenter = function () {
        var mass = 0, plotX = 0, plotY = 0;
        if (this.isInternal) {
            // Calculate weightened mass of the quad node:
            for (var _i = 0, _a = this.nodes; _i < _a.length; _i++) {
                var pointMass = _a[_i];
                if (!pointMass.isEmpty) {
                    mass += pointMass.mass;
                    plotX += pointMass.plotX * pointMass.mass;
                    plotY += pointMass.plotY * pointMass.mass;
                }
            }
            plotX /= mass;
            plotY /= mass;
        }
        else if (this.body) {
            // Just one node, use coordinates directly:
            mass = this.body.mass;
            plotX = this.body.plotX;
            plotY = this.body.plotY;
        }
        // Store details:
        this.mass = mass;
        this.plotX = plotX;
        this.plotY = plotY;
    };
    return QuadTreeNode;
}());
/* *
 *
 *  Default Export
 *
 * */
export default QuadTreeNode;
