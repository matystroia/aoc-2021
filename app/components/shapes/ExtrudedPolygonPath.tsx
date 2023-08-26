import clsx from "clsx";
import { memo } from "react";
import { isEqual, isNumber } from "lodash";

import { parsePercent } from "../../utils";

import { PolygonBorder2 } from "./PolygonBorder2";
import { PolygonBorder } from "./PolygonBorder";

type Point = {
    x: number | string;
    y: number | string;
    interpolate: number;
    concave: boolean;
};

type Side = {
    index: number;
    side: JSX.Element;
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
        style,
        topClass,
        sideClass,
        topBorder = { width: 0 },
        sideBorder = { width: 0 },
        renderBase,
        children,
        side = null,
        sides = [],
    }: {
        path: Point[];
        width: number;
        height: number;
        depth: number;
        angle?: number;
        className?: string;
        style?: object;
        topClass: string;
        sideClass: string;
        topBorder?: { width: number; borderClass?: string };
        sideBorder?: { width: number; borderClass?: string };
        renderBase?: ({ className, style }) => JSX.Element;
        children?: JSX.Element;
        side: JSX.Element;
        sides: Side[];
    }) {
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
        const sideHeight = Math.floor(depth / Math.sin(angleRad));

        const orderedSides = edges.map((_) => side);
        sides.forEach(({ index, side }) => {
            orderedSides[index] = side;
        });

        return (
            <div
                className={clsx("preserve-3d relative", className)}
                style={{ width, height, ...style }}
            >
                {/* TODO: This should be separate component. Maybe move into PolygonBorder? */}
                <div
                    className="absolute w-full h-full preserve-3d"
                    style={{ transform: `translateZ(${depth}px)` }}
                >
                    {topBorder.width ? (
                        <PolygonBorder2
                            baseClass={topClass}
                            borderClass={topBorder.borderClass}
                            polygonPoints={polygonPoints}
                            borderWidth={topBorder.width}
                        />
                    ) : (
                        <div
                            className={clsx("absolute inset-0", topClass)}
                            style={{ clipPath: polygonPath }}
                        />
                    )}
                    {children}
                </div>

                {edges.map((edge, i) => {
                    let sideWidth = edge.length;
                    let xOffset = 0;
                    let sidePolygon = null;
                    if (angle !== 90) {
                        const thisEdge = edges[i];
                        const prevEdge = edges.at(i - 1);
                        const nextEdge = edges[(i + 1) % edges.length];

                        let leftAngle = Math.abs(Math.PI - (nextEdge.angle - thisEdge.angle)) / 2;
                        let rightAngle = Math.abs(Math.PI - (thisEdge.angle - prevEdge.angle)) / 2;

                        const x = depth * Math.tan(Math.PI / 2 - angleRad);

                        const left = x / Math.tan(leftAngle);
                        const right = x / Math.tan(rightAngle);

                        sideWidth = edge.length + Math.max(0, left) + Math.max(0, right);
                        xOffset = -Math.max(right, 0);

                        if (angle > 90) {
                            sidePolygon = [
                                { x: -right, y: 0 },
                                { x: sideWidth + left, y: 0 },
                                { x: sideWidth, y: sideHeight },
                                { x: 0, y: sideHeight },
                            ];
                        } else {
                            sidePolygon = [
                                { x: 0, y: 0 },
                                { x: sideWidth, y: 0 },
                                { x: sideWidth - left, y: sideHeight },
                                { x: right, y: sideHeight },
                            ];
                        }
                    }

                    const clipPath = sidePolygon && getPolygonPath(sidePolygon);
                    const style = {
                        width: sideWidth,
                        height: sideHeight,
                        transform:
                            `translate3d(${edge.x}px, ${edge.y}px, ${depth}px)` +
                            `rotateZ(${edge.angle}rad) rotateX(${angle}deg)` +
                            `translateX(${xOffset}px)` +
                            `translateY(${-sideHeight}px)`,
                    };

                    if (sideBorder.width === 0) {
                        return (
                            <div
                                key={i}
                                className="absolute origin-top-left preserve-3d"
                                style={style}
                            >
                                <div
                                    className={clsx("absolute inset-0", sideClass)}
                                    style={{ clipPath }}
                                />
                                {orderedSides[i]}
                            </div>
                        );
                    }

                    sidePolygon = sidePolygon || [
                        { x: 0, y: 0 },
                        { x: sideWidth, y: 0 },
                        { x: sideWidth, y: sideHeight },
                        { x: 0, y: sideHeight },
                    ];

                    return (
                        <div key={i} className="absolute origin-top-left preserve-3d" style={style}>
                            <PolygonBorder2
                                baseClass={sideClass}
                                borderClass={sideBorder.borderClass}
                                className="absolute inset-0"
                                polygonPoints={sidePolygon}
                                borderWidth={sideBorder.width}
                            />
                            {orderedSides[i]}
                        </div>
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
