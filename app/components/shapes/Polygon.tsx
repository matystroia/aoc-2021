import clsx from "clsx";
import { memo } from "react";
import { isEqual } from "lodash";

import { PolygonBorder } from "./PolygonBorder";

// Harder than it looks. Thank you to Wikipedia:
// https://en.wikipedia.org/wiki/Regular_polygon
export const Polygon = memo(
    function Polygon({
        edges,
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
        edges: { x: number; y: number; length: number; internalAngle: number; angle: number }[];
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

        const polygonPath = edges
            .map(({ x, y }) => `${x + offset.x}px ${y + offset.y}px`)
            .join(",");

        const angleRad = (angle * Math.PI) / 180;
        const sideLength = Math.floor(depth / Math.sin(angleRad));

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
                            clipPath: `polygon(${polygonPath})`,
                        }}
                    />
                ) : (
                    <div
                        className={clsx("absolute h-full w-full", topClass)}
                        style={{
                            transform: `translateZ(${depth}px)`,
                            clipPath: `polygon(${polygonPath})`,
                        }}
                    />
                )}

                {edges.map((edge, i) => {
                    let [left, right, polygonPath] = [0, 0, null];
                    if (angle !== 90) {
                        const leftAngle = edges[i].internalAngle / 2;
                        const rightAngle = edges[(i + 1) % edges.length].internalAngle / 2;

                        left = (depth * Math.tan(Math.PI / 2 - angleRad)) / Math.tan(leftAngle);
                        right = (depth * Math.tan(Math.PI / 2 - angleRad)) / Math.tan(rightAngle);

                        polygonPath = `${left}px 0, ${edge.length + right}px 0, 100% 100%, 0 100%`;
                    }

                    const style = {
                        width: edge.length + left + right,
                        height: sideLength,
                        clipPath: polygonPath && `polygon(${polygonPath})`,
                        transform:
                            `translate3d(${edge.x + offset.x}px, ${
                                edge.y + offset.y
                            }px, ${depth}px)` +
                            `rotateZ(${edge.angle}rad) rotateX(${180 + angle}deg)` +
                            `translateX(${-left}px)`,
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
                        style: { clipPath: `polygon(${polygonPath})` },
                    })}
            </div>
        );
    },
    // TODO: Not sure if this is worth it
    (oldProps, newProps) => isEqual(oldProps, newProps)
);
