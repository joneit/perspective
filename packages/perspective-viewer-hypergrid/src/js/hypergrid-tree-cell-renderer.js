/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const LINE_NODE_SPACE = 16;
const NODE_RADIUS = 3;

export function treeLineRendererPaint(gc, config) {
    var x = config.bounds.x;
    var y = config.bounds.y;
    var width = config.bounds.width;
    var height = config.bounds.height;

    if (config.value === null) {
        return;
    }

    var value = config.value.rollup;
    var leaf = config.value.isLeaf;
    var depth = config.value.rowPath.length - 1;
    var lastChild = config.last;

    var halfDown = y + height / 2;
    var fullDown = y + height;

    var color, backgroundColor;
    if (config.isSelected) {
        color = config.foregroundSelectionColor;
        backgroundColor = config.backgroundSelectionColor;
    } else {
        color = config.color;
        backgroundColor = config.backgroundColor;
    }
    if (config.isRowHovered && config.hoverRowHighlight.enabled && !config.isCellHovered) {
        backgroundColor = config.hoverRowHighlight.backgroundColor;
    } else if (config.isCellHovered && config.hoverCellHighlight.enabled) {
        backgroundColor = config.hoverCellHighlight.backgroundColor;
    }

    gc.save();

    // Fill in background
    gc.fillStyle = backgroundColor;
    gc.fillRect(x, y, width, height);

    gc.globalAlpha = 0.3;
    gc.strokeStyle = gc.fillStyle = color;

    gc.beginPath();

    // Draw vertical lines
    for (var i = 1; i <= depth; i++) {
        var lastOfRank = config.value.rowPath[i - 1][0] === "-";
        var terminal = i === depth;

        x += LINE_NODE_SPACE;

        if (!terminal && lastOfRank) {
            continue;
        }

        var halfLine = terminal && (lastOfRank || (leaf && lastChild));

        gc.moveTo(x, y);
        gc.lineTo(x, halfLine ? halfDown : fullDown);
    }

    // Anchor horizontal line
    gc.moveTo(x, halfDown);
    x += LINE_NODE_SPACE;
    if (!leaf) {
        // Draw horizontal line to edge of node circle
        gc.lineTo(x - NODE_RADIUS, halfDown);

        // Draw node circle
        gc.arc(x, halfDown, NODE_RADIUS, -Math.PI, Math.PI);

        // Fill in circle (always for now)
        if (true || config.isCellHovered) {
            gc.globalAlpha = 0.45;
            gc.fill();
            gc.globalAlpha = 0.3;
        }

        // Draw start of new vertical line
        gc.moveTo(x, halfDown + NODE_RADIUS);
        gc.lineTo(x, fullDown);
    } else {
        // Draw horizontal line without a node circle
        gc.lineTo(x + NODE_RADIUS, halfDown);
    }

    gc.stroke();
    gc.closePath();

    // render message text

    gc.globalAlpha = 1.0;
    gc.fillStyle = config.isSelected ? config.foregroundSelectionColor : config.color;
    gc.textAlign = "start";
    gc.textBaseline = "middle";
    gc.font = config.isSelected ? config.foregroundSelectionFont : config.treeHeaderFont;

    var cellTextOffset = x + 2 * NODE_RADIUS + 3;
    value = config.formatValue(value, config._type);
    var metrics = gc.getTextWidthTruncated(value, width - cellTextOffset + (x - LINE_NODE_SPACE - 3), true);
    gc.fillText(metrics.string ? metrics.string : value, cellTextOffset, halfDown);
    config.minWidth = cellTextOffset + gc.getTextWidth(value) + 15;
    gc.restore();
}
