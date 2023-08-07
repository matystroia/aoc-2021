import clsx from "clsx";
import { range } from "lodash";
import { PolygonBorder } from "./PolygonBorder";

// Harder than it looks. Thank you to Wikipedia:
// https://en.wikipedia.org/wiki/Regular_polygon
export function RegularPolygon({
    edges,
    width,
    height,
    angle = 90,
    className,
    topClass,
    topBorderWidth = 0,
    topBorderClass,
    sideClass,
    sideBorderWidth = 0,
    sideBorderClass,
}) {
    const angleSum = (edges - 2) * Math.PI;
    const internalAngle = angleSum / edges;
    const externalAngle = (2 * Math.PI) / edges;

    const edgeLength = Math.floor(width * Math.sin(Math.PI / edges));

    // Could probably just do transformOrigin: apothem
    const apothem = edgeLength / (2 * Math.tan(Math.PI / edges));

    const sides = [{ x: 0, y: 0, angle: 0 }];
    for (let i = 1; i < edges; i++) {
        sides.push({
            x: sides[i - 1].x + edgeLength * Math.cos(sides[i - 1].angle),
            y: sides[i - 1].y + edgeLength * Math.sin(sides[i - 1].angle),
            angle: sides[i - 1].angle + externalAngle,
        });
    }

    const polygonHeight = edges % 2 == 0 ? apothem * 2 : width / 2 + apothem;
    const xOffset = (width - edgeLength) / 2;

    // No idea why triangles behave differently than other polygons, I've spent way too much time trying to figure it out
    const yOffset = edges == 3 ? width - polygonHeight : (width - polygonHeight) / 2;

    const polygonPath = sides.map(({ x, y }) => `${x + xOffset}px ${y + yOffset}px`).join(",");

    const angleRad = (angle * Math.PI) / 180;
    const sideLength = Math.floor(height / Math.sin(angleRad));
    const extraWidth =
        (2 * (height * Math.tan(Math.PI / 2 - angleRad))) / Math.tan(internalAngle / 2);
    const halfExtraWidth = extraWidth / 2;

    return (
        <div
            className={clsx("preserve-3d relative", className)}
            style={{
                width: width,
                height: width,
            }}
        >
            {topBorderWidth ? (
                <PolygonBorder
                    baseClass={topClass}
                    borderClass={topBorderClass}
                    borderScale={(width - 2 * topBorderWidth) / width}
                    className="absolute h-full w-full"
                    style={{
                        transform: `translateZ(${height}px)`,
                        clipPath: `polygon(${polygonPath})`,
                    }}
                />
            ) : (
                <div
                    className={clsx("absolute h-full w-full", topClass)}
                    style={{
                        transform: `translateZ(${height}px)`,
                        clipPath: `polygon(${polygonPath})`,
                    }}
                />
            )}
            <div
                className="preserve-3d"
                style={{
                    transform: `translate(${xOffset}px, ${yOffset}px) rotateX(90deg)`,
                }}
            >
                {sides.map((side, i) => (
                    <div
                        key={i}
                        className="absolute preserve-3d [transformOrigin:left]"
                        style={{
                            transform: `translate3d(${side.x}px, 0, -${side.y}px) rotateY(${side.angle}rad)`,
                        }}
                    >
                        {sideBorderWidth ? (
                            <div
                                className={clsx("[transformOrigin:bottom]", sideBorderClass)}
                                style={{
                                    width: `${edgeLength + extraWidth}px`,
                                    height: `${sideLength}px`,
                                    clipPath: `polygon(0 0, 100% 0, ${
                                        edgeLength + halfExtraWidth
                                    }px 100%, ${halfExtraWidth}px 100%)`,
                                    transform: `translateX(-${halfExtraWidth}px) rotateX(-${
                                        90 - angle
                                    }deg)`,
                                }}
                            >
                                <div
                                    className={clsx("absolute", sideClass)}
                                    style={{
                                        width: `calc(100% - ${sideBorderWidth * 2}px)`,
                                        height: `calc(100% - ${sideBorderWidth * 2}px)`,
                                        left: `${sideBorderWidth}px`,
                                        right: `${sideBorderWidth}px`,
                                        top: `${sideBorderWidth}px`,
                                        bottom: `${sideBorderWidth}px`,
                                        clipPath: `polygon(0 0, 100% 0, ${
                                            edgeLength + halfExtraWidth - sideBorderWidth
                                        }px 100%, ${halfExtraWidth - sideBorderWidth}px 100%)`,
                                    }}
                                ></div>
                            </div>
                        ) : (
                            <div
                                className={clsx("[transformOrigin:bottom]", sideClass)}
                                style={{
                                    width: `${edgeLength + extraWidth}px`,
                                    height: `${sideLength}px`,
                                    clipPath: `polygon(0 0, 100% 0, ${
                                        edgeLength + halfExtraWidth
                                    }px 100%, ${halfExtraWidth}px 100%)`,
                                    transform: `translateX(-${halfExtraWidth}px) rotateX(-${
                                        90 - angle
                                    }deg)`,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
