import clsx from "clsx";

export function PolygonBorder({
    baseClass,
    borderClass,
    borderScale = 0,
    borderScaleX = borderScale,
    borderScaleY = borderScale,
    className,
    style,
}) {
    const { clipPath } = style;

    return (
        <div className={className} style={{ ...style, clipPath: undefined }}>
            <div
                style={{ clipPath }}
                className={clsx("absolute left-0 top-0 w-full h-full", borderClass)}
            ></div>
            <div
                style={{ clipPath, transform: `scale(${borderScaleX}, ${borderScaleY})` }}
                className={clsx("w-full h-full", baseClass)}
            ></div>
        </div>
    );
    // <div className={clsx("center", className)}>
    //     {children}
    //     <div className={clsx("absolute scale-75", borderClass)}>{children}</div>
    // </div>
}
