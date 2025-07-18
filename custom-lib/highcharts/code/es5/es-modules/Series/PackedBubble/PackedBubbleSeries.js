/* *
 *
 *  (c) 2010-2025 Grzegorz Blachlinski, Sebastian Bochan
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Color from '../../Core/Color/Color.js';
var color = Color.parse;
import DragNodesComposition from '../DragNodesComposition.js';
import GraphLayout from '../GraphLayoutComposition.js';
import H from '../../Core/Globals.js';
var noop = H.noop;
import PackedBubblePoint from './PackedBubblePoint.js';
import PackedBubbleSeriesDefaults from './PackedBubbleSeriesDefaults.js';
import PackedBubbleLayout from './PackedBubbleLayout.js';
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';
var seriesProto = SeriesRegistry.series.prototype, BubbleSeries = SeriesRegistry.seriesTypes.bubble;
import D from '../SimulationSeriesUtilities.js';
var initDataLabels = D.initDataLabels, initDataLabelsDefer = D.initDataLabelsDefer;
import U from '../../Core/Utilities.js';
var addEvent = U.addEvent, clamp = U.clamp, defined = U.defined, extend = U.extend, fireEvent = U.fireEvent, isArray = U.isArray, isNumber = U.isNumber, merge = U.merge, pick = U.pick;
import SVGElement from '../../Core/Renderer/SVG/SVGElement.js';
import TextPath from '../../Extensions/TextPath.js';
TextPath.compose(SVGElement);
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.packedbubble
 *
 * @extends Highcharts.Series
 */
var PackedBubbleSeries = /** @class */ (function (_super) {
    __extends(PackedBubbleSeries, _super);
    function PackedBubbleSeries() {
        /* *
         *
         *  Static Properties
         *
         * */
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.parentNodeMass = 0;
        _this.deferDataLabels = true;
        return _this;
        /* eslint-enable valid-jsdoc */
    }
    /* *
     *
     *  Static Functions
     *
     * */
    PackedBubbleSeries.compose = function (AxisClass, ChartClass, LegendClass) {
        BubbleSeries.compose(AxisClass, ChartClass, LegendClass);
        DragNodesComposition.compose(ChartClass);
        PackedBubbleLayout.compose(ChartClass);
    };
    /* *
     *
     *  Functions
     *
     * */
    /* eslint-disable valid-jsdoc */
    /**
     * Create a single array of all points from all series
     * @private
     */
    PackedBubbleSeries.prototype.accumulateAllPoints = function () {
        var chart = this.chart, allDataPoints = [];
        for (var _i = 0, _a = chart.series; _i < _a.length; _i++) {
            var series = _a[_i];
            if (series.is('packedbubble') && // #13574
                series.reserveSpace()) {
                var valueData = series.getColumn('value');
                // Add data to array only if series is visible
                for (var j = 0; j < valueData.length; j++) {
                    allDataPoints.push([
                        null, null,
                        valueData[j],
                        series.index,
                        j,
                        {
                            id: j,
                            marker: {
                                radius: 0
                            }
                        }
                    ]);
                }
            }
        }
        return allDataPoints;
    };
    /**
     * Adding the basic layout to series points.
     * @private
     */
    PackedBubbleSeries.prototype.addLayout = function () {
        var layoutOptions = this.options.layoutAlgorithm =
            this.options.layoutAlgorithm || {}, layoutType = layoutOptions.type || 'packedbubble', chartOptions = this.chart.options.chart;
        var graphLayoutsStorage = this.chart.graphLayoutsStorage, graphLayoutsLookup = this.chart.graphLayoutsLookup, layout;
        if (!graphLayoutsStorage) {
            this.chart.graphLayoutsStorage = graphLayoutsStorage = {};
            this.chart.graphLayoutsLookup = graphLayoutsLookup = [];
        }
        layout = graphLayoutsStorage[layoutType];
        if (!layout) {
            layoutOptions.enableSimulation =
                !defined(chartOptions.forExport) ?
                    layoutOptions.enableSimulation :
                    !chartOptions.forExport;
            graphLayoutsStorage[layoutType] = layout =
                new GraphLayout.layouts[layoutType]();
            layout.init(layoutOptions);
            graphLayoutsLookup.splice(layout.index, 0, layout);
        }
        this.layout = layout;
        this.points.forEach(function (node) {
            node.mass = 2;
            node.degree = 1;
            node.collisionNmb = 1;
        });
        layout.setArea(0, 0, this.chart.plotWidth, this.chart.plotHeight);
        layout.addElementsToCollection([this], layout.series);
        layout.addElementsToCollection(this.points, layout.nodes);
    };
    /**
     * Function responsible for adding series layout, used for parent nodes.
     * @private
     */
    PackedBubbleSeries.prototype.addSeriesLayout = function () {
        var layoutOptions = this.options.layoutAlgorithm =
            this.options.layoutAlgorithm || {}, layoutType = (layoutOptions.type || 'packedbubble'), graphLayoutsStorage = this.chart.graphLayoutsStorage, graphLayoutsLookup = this.chart.graphLayoutsLookup, parentNodeOptions = merge(layoutOptions, layoutOptions.parentNodeOptions, {
            enableSimulation: this.layout.options.enableSimulation
        });
        var seriesLayout = graphLayoutsStorage[layoutType + '-series'];
        if (!seriesLayout) {
            graphLayoutsStorage[layoutType + '-series'] = seriesLayout =
                new GraphLayout.layouts[layoutType]();
            seriesLayout.init(parentNodeOptions);
            graphLayoutsLookup.splice(seriesLayout.index, 0, seriesLayout);
        }
        this.parentNodeLayout = seriesLayout;
        this.createParentNodes();
    };
    /**
     * The function responsible for calculating the parent node radius
     * based on the total surface of inside-bubbles and the group BBox
     * @private
     */
    PackedBubbleSeries.prototype.calculateParentRadius = function () {
        var bBox = this.seriesBox(), parentPadding = 20, minParentRadius = 20;
        this.parentNodeRadius = clamp(Math.sqrt(2 * this.parentNodeMass / Math.PI) + parentPadding, minParentRadius, bBox ?
            Math.max(Math.sqrt(Math.pow(bBox.width, 2) +
                Math.pow(bBox.height, 2)) / 2 + parentPadding, minParentRadius) :
            Math.sqrt(2 * this.parentNodeMass / Math.PI) + parentPadding);
        if (this.parentNode) {
            this.parentNode.marker.radius =
                this.parentNode.radius = this.parentNodeRadius;
        }
    };
    /**
     * Calculate min and max bubble value for radius calculation.
     * @private
     */
    PackedBubbleSeries.prototype.calculateZExtremes = function () {
        var chart = this.chart, allSeries = chart.series;
        var zMin = this.options.zMin, zMax = this.options.zMax, valMin = Infinity, valMax = -Infinity;
        if (zMin && zMax) {
            return [zMin, zMax];
        }
        // It is needed to deal with null and undefined values
        allSeries.forEach(function (series) {
            series.getColumn('value').forEach(function (y) {
                if (defined(y)) {
                    if (y > valMax) {
                        valMax = y;
                    }
                    if (y < valMin) {
                        valMin = y;
                    }
                }
            });
        });
        zMin = pick(zMin, valMin);
        zMax = pick(zMax, valMax);
        return [zMin, zMax];
    };
    /**
     * Check if two bubbles overlaps.
     * @private
     */
    PackedBubbleSeries.prototype.checkOverlap = function (bubble1, bubble2) {
        var diffX = bubble1[0] - bubble2[0], // Diff of X center values
        diffY = bubble1[1] - bubble2[1], // Diff of Y center values
        sumRad = bubble1[2] + bubble2[2]; // Sum of bubble radius
        return (Math.sqrt(diffX * diffX + diffY * diffY) -
            Math.abs(sumRad)) < -0.001;
    };
    /**
     * Creating parent nodes for split series, in which all the bubbles
     * are rendered.
     * @private
     */
    PackedBubbleSeries.prototype.createParentNodes = function () {
        var _this = this;
        var PackedBubblePoint = this.pointClass, chart = this.chart, parentNodeLayout = this.parentNodeLayout, layoutOptions = this.layout.options;
        var nodeAdded, parentNode = this.parentNode, parentMarkerOptions = {
            radius: this.parentNodeRadius,
            lineColor: this.color,
            fillColor: color(this.color).brighten(0.4).get()
        };
        if (layoutOptions.parentNodeOptions) {
            parentMarkerOptions = merge(layoutOptions.parentNodeOptions.marker || {}, parentMarkerOptions);
        }
        this.parentNodeMass = 0;
        this.points.forEach(function (p) {
            _this.parentNodeMass +=
                Math.PI * Math.pow(p.marker.radius, 2);
        });
        this.calculateParentRadius();
        parentNodeLayout.nodes
            .forEach(function (node) {
            if (node.seriesIndex === _this.index) {
                nodeAdded = true;
            }
        });
        parentNodeLayout.setArea(0, 0, chart.plotWidth, chart.plotHeight);
        if (!nodeAdded) {
            if (!parentNode) {
                parentNode = new PackedBubblePoint(this, {
                    mass: this.parentNodeRadius / 2,
                    marker: parentMarkerOptions,
                    dataLabels: {
                        inside: false
                    },
                    states: {
                        normal: {
                            marker: parentMarkerOptions
                        },
                        hover: {
                            marker: parentMarkerOptions
                        }
                    },
                    dataLabelOnNull: true,
                    degree: this.parentNodeRadius,
                    isParentNode: true,
                    seriesIndex: this.index
                });
                this.chart.allParentNodes.push(parentNode);
            }
            if (this.parentNode) {
                parentNode.plotX = this.parentNode.plotX;
                parentNode.plotY = this.parentNode.plotY;
            }
            this.parentNode = parentNode;
            parentNodeLayout.addElementsToCollection([this], parentNodeLayout.series);
            parentNodeLayout.addElementsToCollection([parentNode], parentNodeLayout.nodes);
        }
    };
    /**
     * Function responsible for adding all the layouts to the chart.
     * @private
     */
    PackedBubbleSeries.prototype.deferLayout = function () {
        // TODO split layouts to independent methods
        var layoutOptions = this.options.layoutAlgorithm;
        if (!this.visible) {
            return;
        }
        // Layout is using nodes for position calculation
        this.addLayout();
        if (layoutOptions.splitSeries) {
            this.addSeriesLayout();
        }
    };
    PackedBubbleSeries.prototype.destroy = function () {
        var _this = this;
        // Remove the series from all layouts series collections #11469
        if (this.chart.graphLayoutsLookup) {
            this.chart.graphLayoutsLookup.forEach(function (layout) {
                layout.removeElementFromCollection(_this, layout.series);
            }, this);
        }
        if (this.parentNode &&
            this.parentNodeLayout) {
            this.parentNodeLayout.removeElementFromCollection(this.parentNode, this.parentNodeLayout.nodes);
            if (this.parentNode.dataLabel) {
                this.parentNode.dataLabel =
                    this.parentNode.dataLabel.destroy();
            }
        }
        seriesProto.destroy.apply(this, arguments);
    };
    /**
     * Packedbubble has two separate collections of nodes if split, render
     * dataLabels for both sets:
     * @private
     */
    PackedBubbleSeries.prototype.drawDataLabels = function () {
        // We defer drawing the dataLabels
        // until dataLabels.animation.defer time passes
        if (this.deferDataLabels) {
            return;
        }
        seriesProto.drawDataLabels.call(this, this.points);
        // Render parentNode labels:
        if (this.parentNode) {
            this.parentNode.formatPrefix = 'parentNode';
            seriesProto.drawDataLabels.call(this, [this.parentNode]);
        }
    };
    /**
     * Create Background/Parent Nodes for split series.
     * @private
     */
    PackedBubbleSeries.prototype.drawGraph = function () {
        var _a;
        // If the series is not using layout, don't add parent nodes
        if (!this.layout || !this.layout.options.splitSeries) {
            return;
        }
        var chart = this.chart, nodeMarker = this.layout.options.parentNodeOptions.marker, parentOptions = {
            fill: (nodeMarker.fillColor ||
                color(this.color).brighten(0.4).get()),
            opacity: nodeMarker.fillOpacity,
            stroke: nodeMarker.lineColor || this.color,
            'stroke-width': pick(nodeMarker.lineWidth, this.options.lineWidth)
        };
        var parentAttribs = {};
        // Create the group for parent Nodes if doesn't exist
        // If exists it will only be adjusted to the updated plot size (#12063)
        this.parentNodesGroup = this.plotGroup('parentNodesGroup', 'parentNode', this.visible ? 'inherit' : 'hidden', 0.1, chart.seriesGroup);
        (_a = this.group) === null || _a === void 0 ? void 0 : _a.attr({
            zIndex: 2
        });
        this.calculateParentRadius();
        if (this.parentNode &&
            defined(this.parentNode.plotX) &&
            defined(this.parentNode.plotY) &&
            defined(this.parentNodeRadius)) {
            parentAttribs = merge({
                x: this.parentNode.plotX -
                    this.parentNodeRadius,
                y: this.parentNode.plotY -
                    this.parentNodeRadius,
                width: this.parentNodeRadius * 2,
                height: this.parentNodeRadius * 2
            }, parentOptions);
            if (!this.parentNode.graphic) {
                this.graph = this.parentNode.graphic =
                    chart.renderer.symbol(parentOptions.symbol)
                        .add(this.parentNodesGroup);
            }
            this.parentNode.graphic.attr(parentAttribs);
        }
    };
    PackedBubbleSeries.prototype.drawTracker = function () {
        var parentNode = this.parentNode;
        // Chart = series.chart,
        // pointer = chart.pointer,
        // onMouseOver = function (e: PointerEvent): void {
        //     const point = pointer.getPointFromEvent(e);
        //     // undefined on graph in scatterchart
        //     if (typeof point !== 'undefined') {
        //         pointer.isDirectTouch = true;
        //         point.onMouseOver(e);
        //     }
        // };
        var dataLabels;
        _super.prototype.drawTracker.call(this);
        // Add reference to the point
        if (parentNode) {
            dataLabels = (isArray(parentNode.dataLabels) ?
                parentNode.dataLabels :
                (parentNode.dataLabel ? [parentNode.dataLabel] : []));
            if (parentNode.graphic) {
                parentNode.graphic.element.point = parentNode;
            }
            dataLabels.forEach(function (dataLabel) {
                (dataLabel.div || dataLabel.element).point = parentNode;
            });
        }
    };
    /**
     * Calculate radius of bubbles in series.
     * @private
     */
    PackedBubbleSeries.prototype.getPointRadius = function () {
        var _this = this;
        var chart = this.chart, plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, seriesOptions = this.options, useSimulation = seriesOptions.useSimulation, smallestSize = Math.min(plotWidth, plotHeight), extremes = {}, radii = [], allDataPoints = chart.allDataPoints || [], allDataPointsLength = allDataPoints.length;
        var minSize, maxSize, value, radius;
        ['minSize', 'maxSize'].forEach(function (prop) {
            var length = parseInt(seriesOptions[prop], 10), isPercent = /%$/.test(seriesOptions[prop]);
            extremes[prop] = isPercent ?
                smallestSize * length / 100 :
                length * Math.sqrt(allDataPointsLength);
        });
        chart.minRadius = minSize = extremes.minSize /
            Math.sqrt(allDataPointsLength);
        chart.maxRadius = maxSize = extremes.maxSize /
            Math.sqrt(allDataPointsLength);
        var zExtremes = useSimulation ?
            this.calculateZExtremes() :
            [minSize, maxSize];
        allDataPoints.forEach(function (point, i) {
            value = useSimulation ?
                clamp(point[2], zExtremes[0], zExtremes[1]) :
                point[2];
            radius = _this.getRadius(zExtremes[0], zExtremes[1], minSize, maxSize, value);
            if (radius === 0) {
                radius = null;
            }
            allDataPoints[i][2] = radius;
            radii.push(radius);
        });
        this.radii = radii;
    };
    PackedBubbleSeries.prototype.init = function () {
        seriesProto.init.apply(this, arguments);
        initDataLabelsDefer.call(this);
        /* eslint-disable no-invalid-this */
        // When one series is modified, the others need to be recomputed
        this.eventsToUnbind.push(addEvent(this, 'updatedData', function () {
            var _this = this;
            this.chart.series.forEach(function (s) {
                if (s.type === _this.type) {
                    s.isDirty = true;
                }
            }, this);
        }));
        /* eslint-enable no-invalid-this */
        return this;
    };
    /**
     * Mouse up action, finalizing drag&drop.
     * @private
     * @param {Highcharts.Point} point The point that event occurred.
     */
    PackedBubbleSeries.prototype.onMouseUp = function (dnPoint) {
        var point = dnPoint;
        if (point.fixedPosition && !point.removed) {
            var layout_1 = this.layout, parentNodeLayout = this.parentNodeLayout;
            var distanceXY_1, distanceR_1;
            if (!point.isParentNode &&
                parentNodeLayout &&
                layout_1.options.dragBetweenSeries) {
                parentNodeLayout.nodes.forEach(function (node) {
                    if (point && point.marker &&
                        node !== point.series.parentNode) {
                        distanceXY_1 = layout_1.getDistXY(point, node);
                        distanceR_1 = (layout_1.vectorLength(distanceXY_1) -
                            node.marker.radius -
                            point.marker.radius);
                        if (distanceR_1 < 0) {
                            node.series.addPoint(merge(point.options, {
                                plotX: point.plotX,
                                plotY: point.plotY
                            }), false);
                            layout_1.removeElementFromCollection(point, layout_1.nodes);
                            point.remove();
                        }
                    }
                });
            }
            DragNodesComposition.onMouseUp.apply(this, arguments);
        }
    };
    /**
     * This is the main function responsible
     * for positioning all of the bubbles
     * allDataPoints - bubble array, in format [pixel x value,
     * pixel y value, radius,
     * related series index, related point index]
     * @private
     * @param {Array<Highcharts.PackedBubbleData>} allDataPoints All points from all series
     * @return {Array<Highcharts.PackedBubbleData>} Positions of all bubbles
     */
    PackedBubbleSeries.prototype.placeBubbles = function (allDataPoints) {
        var checkOverlap = this.checkOverlap, positionBubble = this.positionBubble, bubblePos = [];
        var stage = 1, j = 0, k = 0, calculatedBubble, arr = [], i;
        // Sort all points
        var sortedArr = allDataPoints.sort(function (a, b) {
            return b[2] - a[2];
        });
        if (sortedArr.length) {
            // Create first bubble in the middle of the chart
            bubblePos.push([
                [
                    0, // Starting in 0,0 coordinates
                    0,
                    sortedArr[0][2], // Radius
                    sortedArr[0][3], // Series index
                    sortedArr[0][4]
                ] // Point index
            ]); // 0 level bubble
            if (sortedArr.length > 1) {
                bubblePos.push([
                    [
                        0,
                        (0 - sortedArr[1][2] -
                            sortedArr[0][2]),
                        // Move bubble above first one
                        sortedArr[1][2],
                        sortedArr[1][3],
                        sortedArr[1][4]
                    ]
                ]); // 1 level 1st bubble
                // first two already positioned so starting from 2
                for (i = 2; i < sortedArr.length; i++) {
                    sortedArr[i][2] = sortedArr[i][2] || 1;
                    // In case if radius is calculated as 0.
                    calculatedBubble = positionBubble(bubblePos[stage][j], bubblePos[stage - 1][k], sortedArr[i]); // Calculate initial bubble position
                    if (checkOverlap(calculatedBubble, bubblePos[stage][0])) {
                        /* If new bubble is overlapping with first bubble
                            * in current level (stage)
                            */
                        bubblePos.push([]);
                        k = 0;
                        /* Reset index of bubble, used for
                            * positioning the bubbles around it,
                            * we are starting from first bubble in next
                            * stage because we are changing level to higher
                            */
                        bubblePos[stage + 1].push(positionBubble(bubblePos[stage][j], bubblePos[stage][0], sortedArr[i]));
                        // (last bubble, 1. from curr stage, new bubble)
                        stage++; // The new level is created, above current
                        j = 0; // Set the index of bubble in curr level to 0
                    }
                    else if (stage > 1 &&
                        bubblePos[stage - 1][k + 1] &&
                        checkOverlap(calculatedBubble, bubblePos[stage - 1][k + 1])) {
                        /* If new bubble is overlapping with one of the prev
                            * stage bubbles, it means that - bubble, used for
                            * positioning the bubbles around it has changed
                            * so we need to recalculate it
                            */
                        k++;
                        bubblePos[stage].push(positionBubble(bubblePos[stage][j], bubblePos[stage - 1][k], sortedArr[i]));
                        // (last bubble, prev stage bubble, new bubble)
                        j++;
                    }
                    else { // Simply add calculated bubble
                        j++;
                        bubblePos[stage].push(calculatedBubble);
                    }
                }
            }
            this.chart.stages = bubblePos;
            // It may not be necessary but adding it just in case -
            // it is containing all of the bubble levels
            this.chart.rawPositions =
                []
                    .concat.apply([], bubblePos);
            // Bubble positions merged into one array
            this.resizeRadius();
            arr = this.chart.rawPositions;
        }
        return arr;
    };
    /**
     * Function that checks for a parentMarker and sets the correct opacity.
     * @private
     * @param {Highcharts.Pack} point
     * Candidate point for opacity correction.
     * @param {string} [state]
     * The point state, can be either `hover`, `select` or 'normal'. If
     * undefined, normal state is assumed.
     *
     * @return {Highcharts.SVGAttributes}
     * The presentational attributes to be set on the point.
     */
    PackedBubbleSeries.prototype.pointAttribs = function (point, state) {
        var options = this.options, hasParentMarker = point && point.isParentNode;
        var markerOptions = options.marker;
        if (hasParentMarker &&
            options.layoutAlgorithm &&
            options.layoutAlgorithm.parentNodeOptions) {
            markerOptions = options.layoutAlgorithm.parentNodeOptions.marker;
        }
        var fillOpacity = markerOptions.fillOpacity, attr = seriesProto.pointAttribs.call(this, point, state);
        if (fillOpacity !== 1) {
            attr['fill-opacity'] = fillOpacity;
        }
        return attr;
    };
    /**
     * Function that is adding one bubble based on positions and sizes of
     * two other bubbles, lastBubble is the last added bubble, newOrigin is
     * the bubble for positioning new bubbles. nextBubble is the currently
     * added bubble for which we are calculating positions
     * @private
     * @param {Array<number>} lastBubble The closest last bubble
     * @param {Array<number>} newOrigin New bubble
     * @param {Array<number>} nextBubble The closest next bubble
     * @return {Array<number>} Bubble with correct positions
     */
    PackedBubbleSeries.prototype.positionBubble = function (lastBubble, newOrigin, nextBubble) {
        var sqrt = Math.sqrt, asin = Math.asin, acos = Math.acos, pow = Math.pow, abs = Math.abs, distance = sqrt(// Dist between lastBubble and newOrigin
        pow((lastBubble[0] - newOrigin[0]), 2) +
            pow((lastBubble[1] - newOrigin[1]), 2)), alfa = acos(
        // From cosinus theorem: alfa is an angle used for
        // calculating correct position
        (pow(distance, 2) +
            pow(nextBubble[2] + newOrigin[2], 2) -
            pow(nextBubble[2] + lastBubble[2], 2)) / (2 * (nextBubble[2] + newOrigin[2]) * distance)), beta = asin(// From sinus theorem.
        abs(lastBubble[0] - newOrigin[0]) /
            distance), 
        // Providing helping variables, related to angle between
        // lastBubble and newOrigin
        gamma = (lastBubble[1] - newOrigin[1]) < 0 ? 0 : Math.PI, 
        // If new origin y is smaller than last bubble y value
        // (2 and 3 quarter),
        // add Math.PI to final angle
        delta = (lastBubble[0] - newOrigin[0]) *
            (lastBubble[1] - newOrigin[1]) < 0 ?
            1 : -1, // (1st and 3rd quarter)
        finalAngle = gamma + alfa + beta * delta, cosA = Math.cos(finalAngle), sinA = Math.sin(finalAngle), posX = newOrigin[0] + (newOrigin[2] + nextBubble[2]) * sinA, 
        // Center of new origin + (radius1 + radius2) * sinus A
        posY = newOrigin[1] - (newOrigin[2] + nextBubble[2]) * cosA;
        return [
            posX,
            posY,
            nextBubble[2],
            nextBubble[3],
            nextBubble[4]
        ]; // The same as described before
    };
    PackedBubbleSeries.prototype.render = function () {
        var dataLabels = [];
        seriesProto.render.apply(this, arguments);
        // #10823 - dataLabels should stay visible
        // when enabled allowOverlap.
        if (!this.options.dataLabels.allowOverlap) {
            this.data.forEach(function (point) {
                if (isArray(point.dataLabels)) {
                    point.dataLabels.forEach(function (dataLabel) {
                        dataLabels.push(dataLabel);
                    });
                }
            });
            // Only hide overlapping dataLabels for layouts that
            // use simulation. Spiral packedbubble don't need
            // additional dataLabel hiding on every simulation step
            if (this.options.useSimulation) {
                this.chart.hideOverlappingLabels(dataLabels);
            }
        }
    };
    /**
     * The function responsible for resizing the bubble radius.
     * In shortcut: it is taking the initially
     * calculated positions of bubbles. Then it is calculating the min max
     * of both dimensions, creating something in shape of bBox.
     * The comparison of bBox and the size of plotArea
     * (later it may be also the size set by customer) is giving the
     * value how to recalculate the radius so it will match the size
     * @private
     */
    PackedBubbleSeries.prototype.resizeRadius = function () {
        var chart = this.chart, positions = chart.rawPositions, min = Math.min, max = Math.max, plotLeft = chart.plotLeft, plotTop = chart.plotTop, chartHeight = chart.plotHeight, chartWidth = chart.plotWidth;
        var minX, maxX, minY, maxY, radius;
        minX = minY = Number.POSITIVE_INFINITY; // Set initial values
        maxX = maxY = Number.NEGATIVE_INFINITY;
        for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
            var position = positions_1[_i];
            radius = position[2];
            minX = min(minX, position[0] - radius);
            // (x center-radius) is the min x value used by specific bubble
            maxX = max(maxX, position[0] + radius);
            minY = min(minY, position[1] - radius);
            maxY = max(maxY, position[1] + radius);
        }
        var bBox = [maxX - minX, maxY - minY], spaceRatio = [
            (chartWidth - plotLeft) / bBox[0],
            (chartHeight - plotTop) / bBox[1]
        ], smallerDimension = min.apply([], spaceRatio);
        if (Math.abs(smallerDimension - 1) > 1e-10) {
            // If bBox is considered not the same width as possible size
            for (var _a = 0, positions_2 = positions; _a < positions_2.length; _a++) {
                var position = positions_2[_a];
                position[2] *= smallerDimension;
            }
            this.placeBubbles(positions);
        }
        else {
            /** If no radius recalculation is needed, we need to position
             * the whole bubbles in center of chart plotarea
             * for this, we are adding two parameters,
             * diffY and diffX, that are related to differences
             * between the initial center and the bounding box
             */
            chart.diffY = chartHeight / 2 +
                plotTop - minY - (maxY - minY) / 2;
            chart.diffX = chartWidth / 2 +
                plotLeft - minX - (maxX - minX) / 2;
        }
    };
    /**
     * The function responsible for calculating series bubble' s bBox.
     * Needed because of exporting failure when useSimulation
     * is set to false
     * @private
     */
    PackedBubbleSeries.prototype.seriesBox = function () {
        var chart = this.chart, data = this.data, max = Math.max, min = Math.min, bBox = [
            chart.plotLeft,
            chart.plotLeft + chart.plotWidth,
            chart.plotTop,
            chart.plotTop + chart.plotHeight
        ];
        var radius;
        data.forEach(function (p) {
            if (defined(p.plotX) &&
                defined(p.plotY) &&
                p.marker.radius) {
                radius = p.marker.radius;
                bBox[0] = min(bBox[0], p.plotX - radius);
                bBox[1] = max(bBox[1], p.plotX + radius);
                bBox[2] = min(bBox[2], p.plotY - radius);
                bBox[3] = max(bBox[3], p.plotY + radius);
            }
        });
        return isNumber(bBox.width / bBox.height) ?
            bBox :
            null;
    };
    /**
     * Needed because of z-indexing issue if point is added in series.group
     * @private
     */
    PackedBubbleSeries.prototype.setVisible = function () {
        var series = this;
        seriesProto.setVisible.apply(series, arguments);
        if (series.parentNodeLayout && series.graph) {
            if (series.visible) {
                series.graph.show();
                if (series.parentNode.dataLabel) {
                    series.parentNode.dataLabel.show();
                }
            }
            else {
                series.graph.hide();
                series.parentNodeLayout.removeElementFromCollection(series.parentNode, series.parentNodeLayout.nodes);
                if (series.parentNode.dataLabel) {
                    series.parentNode.dataLabel.hide();
                }
            }
        }
        else if (series.layout) {
            if (series.visible) {
                series.layout.addElementsToCollection(series.points, series.layout.nodes);
            }
            else {
                series.points.forEach(function (node) {
                    series.layout.removeElementFromCollection(node, series.layout.nodes);
                });
            }
        }
    };
    /**
     * Extend the base translate method to handle bubble size,
     * and correct positioning them.
     * @private
     */
    PackedBubbleSeries.prototype.translate = function () {
        var chart = this.chart, data = this.data, index = this.index, useSimulation = this.options.useSimulation;
        var point, radius, positions;
        this.generatePoints();
        // Merged data is an array with all of the data from all series
        if (!defined(chart.allDataPoints)) {
            chart.allDataPoints = this.accumulateAllPoints();
            // Calculate radius for all added data
            this.getPointRadius();
        }
        // After getting initial radius, calculate bubble positions
        if (useSimulation) {
            positions = chart.allDataPoints;
        }
        else {
            positions = this.placeBubbles(chart.allDataPoints);
            this.options.draggable = false;
        }
        // Set the shape and arguments to be picked up in drawPoints
        for (var _i = 0, positions_3 = positions; _i < positions_3.length; _i++) {
            var position = positions_3[_i];
            if (position[3] === index) {
                // Update the series points with the val from positions
                // array
                point = data[position[4]];
                radius = pick(position[2], void 0);
                if (!useSimulation) {
                    point.plotX = (position[0] - chart.plotLeft +
                        chart.diffX);
                    point.plotY = (position[1] - chart.plotTop +
                        chart.diffY);
                }
                if (isNumber(radius)) {
                    point.marker = extend(point.marker, {
                        radius: radius,
                        width: 2 * radius,
                        height: 2 * radius
                    });
                    point.radius = radius;
                }
            }
        }
        if (useSimulation) {
            this.deferLayout();
        }
        fireEvent(this, 'afterTranslate');
    };
    PackedBubbleSeries.defaultOptions = merge(BubbleSeries.defaultOptions, PackedBubbleSeriesDefaults);
    return PackedBubbleSeries;
}(BubbleSeries));
extend(PackedBubbleSeries.prototype, {
    pointClass: PackedBubblePoint,
    axisTypes: [],
    directTouch: true,
    forces: ['barycenter', 'repulsive'],
    hasDraggableNodes: true,
    invertible: false,
    isCartesian: false,
    noSharedTooltip: true,
    pointArrayMap: ['value'],
    pointValKey: 'value',
    requireSorting: false,
    trackerGroups: ['group', 'dataLabelsGroup', 'parentNodesGroup'],
    initDataLabels: initDataLabels,
    alignDataLabel: seriesProto.alignDataLabel,
    indexateNodes: noop,
    onMouseDown: DragNodesComposition.onMouseDown,
    onMouseMove: DragNodesComposition.onMouseMove,
    redrawHalo: DragNodesComposition.redrawHalo,
    searchPoint: noop // Solving #12287
});
SeriesRegistry.registerSeriesType('packedbubble', PackedBubbleSeries);
/* *
 *
 *  Default Export
 *
 * */
export default PackedBubbleSeries;
