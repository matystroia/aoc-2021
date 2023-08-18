import clsx from "clsx";
// Thank you Stanko!!!
import offsetPolygon from "offset-polygon";

// Turns out this is non-trivial
// See here: https://stackoverflow.com/questions/1109536/an-algorithm-for-inflating-deflating-offsetting-buffering-polygons
// TODO: Memo
export function PolygonBorder2({
    baseClass,
    borderClass,
    className,
    style,
    polygonPoints,
    borderWidth,
}) {
    const insetPoints = offsetPolygon(polygonPoints, -borderWidth);

    console.log("Polygon Border Render");

    const borderPoints = polygonPoints.concat(
        polygonPoints[0],
        insetPoints.slice().reverse(),
        insetPoints.at(-1)
    );

    return (
        <div className={className} style={style}>
            <div
                className={clsx("absolute inset-0", baseClass)}
                style={{
                    clipPath: `polygon(${polygonPoints
                        .map(({ x, y }) => `${x}px ${y}px`)
                        .join(",")})`,
                }}
            />
            <div
                className={clsx("absolute inset-0", borderClass)}
                style={{
                    clipPath: `polygon(${borderPoints
                        .map(({ x, y }) => `${x}px ${y}px`)
                        .join(",")})`,
                }}
            />
        </div>
    );

    // return (
    //     <div className={className} style={{ ...style, clipPath: undefined }}>

    //         <div style={{ clipPath }} className={clsx("absolute inset-0", borderClass)}></div>
    //         <div
    //             style={{ clipPath, transform: `scale(${borderScaleX}, ${borderScaleY})` }}
    //             className={clsx("w-full h-full", baseClass)}
    //         ></div>
    //     </div>
    // );
    // <div className={clsx("center", className)}>
    //     {children}
    //     <div className={clsx("absolute scale-75", borderClass)}>{children}</div>
    // </div>
}
