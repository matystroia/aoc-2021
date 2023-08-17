import clsx from "clsx";
import { PolygonBorder } from "./PolygonBorder";
import { memo } from "react";
import { isEqual, isNumber } from "lodash";
import { parsePercent } from "../../utils";

type Point = {
    x: number | string;
    y: number | string;
    interpolate: number;
    concave: boolean;
};

const toAbsolute = (p: Point, width: number, height: number) => ({
    x: isNumber(p.x) ? p.x : parsePercent(p.x) * width,
    y: isNumber(p.y) ? p.y : parsePercent(p.y) * height,
});

export const getPolygonPoints = (path: Point[], width: number, height: number) => {
    let points = path.flatMap((p, i) => {
        if (!p.interpolate) return toAbsolute(p, width, height);

        const prevPoint = toAbsolute(path.at(i - 1), width, height);
        const nextPoint = toAbsolute(path[(i + 1) % path.length], width, height);

        const xDelta = nextPoint.x - prevPoint.x;
        const yDelta = nextPoint.y - prevPoint.y;

        const segments = p.interpolate + 1;
        const segmentAngle = Math.PI / 2 / segments;

        let center: { x: number; y: number };
        const centers = [
            { x: nextPoint.x, y: prevPoint.y },
            { x: prevPoint.x, y: nextPoint.y },
        ];
        if ((xDelta * yDelta < 0 && !p.concave) || (xDelta * yDelta > 0 && p.concave)) {
            center = centers[0];
        } else {
            center = centers[1];
        }

        let quadrant: number;
        if (xDelta > 0 && yDelta > 0) quadrant = 3;
        if (xDelta > 0 && yDelta < 0) quadrant = 2;
        if (xDelta < 0 && yDelta > 0) quadrant = 0;
        if (xDelta < 0 && yDelta < 0) quadrant = 1;

        if (p.concave) quadrant += 2;

        const interpolationPoints = [];
        for (let i = 1; i <= p.interpolate; i++) {
            const pAngle = (Math.PI / 2) * quadrant + segmentAngle * i;
            interpolationPoints.push({
                x: center.x + Math.cos(pAngle) * Math.abs(xDelta),
                y: center.y + Math.sin(pAngle) * Math.abs(yDelta),
            });
        }

        if (p.concave) interpolationPoints.reverse();

        return interpolationPoints;
    });
    return points;
};

export const getPolygonPath = (points: Point[]) => {
    const path = points.map(({ x, y }) => `${x}px ${y}px`).join(",");
    return `polygon(${path})`;
};

// Harder than it looks. Thank you to Wikipedia:
// https://en.wikipedia.org/wiki/Regular_polygon
export const ExtrudedPolygonPath = memo(
    function PathPolygon({
        path,
        width,
        height = width,
        depth,
        angle = 90,
        className,
        topClass,
        sideClass,
        topBorder = { width: 0 },
        sideBorder = { width: 0 },
        offset = { x: 0, y: 0 },
        renderBase,
    }: {
        path: Point[];
        width: number;
        height: number;
        depth: number;
        angle?: number;
        className?: string;
        topClass: string;
        sideClass: string;
        topBorder?: { width: number; borderClass?: string };
        sideBorder?: { width: number; borderClass?: string };
        offset?: { x: number; y: number };
        renderBase?: ({ className, style }) => JSX.Element;
    }) {
        // TODO: Offset!!!

        console.log("RERENDER");

        const polygonPoints = getPolygonPoints(path, width, height);
        const polygonPath = getPolygonPath(polygonPoints);

        let edges: { x: number; y: number; angle: number; length: number }[] = [];
        for (let i = 0; i < polygonPoints.length; i++) {
            const p1 = polygonPoints[i];
            const p2 = polygonPoints[(i + 1) % polygonPoints.length];

            const deltaX = p2.x - p1.x;
            const deltaY = p2.y - p1.y;

            const angle = Math.atan(deltaY / deltaX);
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            edges.push({ x: p1.x, y: p1.y, angle: deltaX < 0 ? angle + Math.PI : angle, length });
        }

        const angleRad = (angle * Math.PI) / 180;
        const sideLength = Math.floor(depth / Math.sin(angleRad));

        console.log({ edges });

        return (
            <div className={clsx("preserve-3d relative", className)} style={{ width, height }}>
                {topBorder.width ? (
                    <PolygonBorder
                        baseClass={topClass}
                        borderClass={topBorder.borderClass}
                        borderScaleX={(width - 2 * topBorder.width) / width}
                        borderScaleY={(height - 2 * topBorder.width) / height}
                        className="absolute w-full h-full"
                        style={{
                            transform: `translateZ(${depth}px)`,
                            clipPath: polygonPath,
                        }}
                    />
                ) : (
                    <div
                        className={clsx("absolute h-full w-full", topClass)}
                        style={{
                            transform: `translateZ(${depth}px)`,
                            clipPath: polygonPath,
                        }}
                    />
                )}

                {edges.map((edge, i) => {
                    let [left, right, polygonPath] = [0, 0, null];
                    if (angle !== 90) {
                        const thisEdge = edges[i];
                        const prevEdge = edges.at(i - 1);
                        const nextEdge = edges[(i + 1) % edges.length];

                        let leftAngle = Math.abs(Math.PI - (nextEdge.angle - thisEdge.angle)) / 2;
                        let rightAngle = Math.abs(Math.PI - (thisEdge.angle - prevEdge.angle)) / 2;

                        const x = depth * Math.tan(Math.PI / 2 - angleRad);

                        left = x / Math.tan(leftAngle);
                        right = x / Math.tan(rightAngle);

                        if (angle > 90) {
                            polygonPath = `${-left}px 0, calc(100% - ${-right}px) 0, 100% 100%, 0 100%`;
                            left = 0;
                            right = 0;
                        } else {
                            polygonPath = `0 0, 100% 0, calc(100% - ${left}px) 100%, ${right}px 100%`;
                        }
                    }

                    const style = {
                        width: edge.length + left + right,
                        height: sideLength,
                        clipPath: polygonPath && `polygon(${polygonPath})`,
                        transform:
                            `translate3d(${edge.x + offset.x}px, ${
                                edge.y + offset.y
                            }px, ${depth}px)` +
                            `rotateZ(${edge.angle}rad) rotateX(${angle}deg)` +
                            `translateX(${-right}px)` +
                            `translateY(${-sideLength}px)`,
                    };

                    return sideBorder.width ? (
                        <PolygonBorder
                            baseClass={sideClass}
                            borderScaleX={(edge.length - 2 * sideBorder.width) / edge.length}
                            borderScaleY={(sideLength - 2 * sideBorder.width) / sideLength}
                            borderClass={sideBorder.borderClass}
                            className="absolute origin-top-left"
                            style={style}
                        />
                    ) : (
                        <div
                            key={i}
                            className={clsx("absolute origin-top-left", sideClass)}
                            style={style}
                        />
                    );
                })}

                {renderBase &&
                    renderBase({
                        className: "absolute w-full h-full",
                        style: { clipPath: polygonPath },
                    })}
            </div>
        );
    },
    // TODO: Not sure if this is worth it
    (oldProps, newProps) => isEqual(oldProps, newProps)
);
