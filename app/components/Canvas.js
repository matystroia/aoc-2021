import { useEffect } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { maxBy, minBy, noop } from "lodash";

export class CanvasContext {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        this.extremePoints = null;
    }

    fit(points, padding = 0) {
        this.extremePoints = {
            minPointX: minBy(points, "x").x,
            maxPointX: maxBy(points, "x").x,
            minPointY: minBy(points, "y").y,
            maxPointY: maxBy(points, "y").y,

            minX: 0 + padding,
            maxX: this.width - padding,
            minY: 0 + padding,
            maxY: this.height - padding,
        };
    }

    interpolatePoint({ x, y }) {
        const {
            minPointX,
            maxPointX,
            minPointY,
            maxPointY,
            minX,
            maxX,
            minY,
            maxY,
        } = this.extremePoints;

        const [deltaX, deltaY] = [maxX - minX, maxY - minY];
        return {
            x: minX + ((x - minPointX) / maxPointX) * deltaX,
            y: minY + ((y - minPointY) / maxPointY) * deltaY,
        };
    }

    line(from, to) {
        const p1 = this.interpolatePoint(from);
        const p2 = this.interpolatePoint(to);

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    circle(center, radius) {
        const p = this.interpolatePoint(center);

        this.ctx.beginPath();
        this.ctx.ellipse(p.x, p.y, radius, radius, 0, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

export function Canvas({ onDraw, ...props }) {
    const { wrapperRef, canvasRef, canvasProps } = useCanvas();

    useEffect(() => {
        const canvasNode = canvasRef.current;
        if (!canvasNode) return;

        const ctx = canvasNode.getContext("2d");
        const size = { width: canvasProps.width, height: canvasProps.height };
        // TODO: Might as well pass an instance of CanvasContext here
        onDraw(ctx, size);
        return () => ctx.reset();
    });

    return (
        <div ref={wrapperRef} {...props}>
            <canvas {...canvasProps} className="canvas-grid" />
        </div>
    );
}
