import clsx from "clsx";
import { clone } from "lodash";

// Great article:
// https://css-tricks.com/css-in-3d-learning-to-think-in-cubes-instead-of-boxes/
export function Box({
    depth = 10,
    angle = 90,
    borderWidth = 0,
    children,
    className,
    style,
    sideClass,
    borderClass,
}) {
    const sideWidth = Math.floor(depth / Math.sin((angle * Math.PI) / 180));

    const extraWidth = Math.floor((2 * depth) / Math.tan((angle * Math.PI) / 180));
    const halfExtraWidth = Math.floor((2 * depth) / Math.tan((angle * Math.PI) / 180) / 2);

    const wrapperStyle = style ? clone(style) : { transform: "" };
    wrapperStyle.transform += ` translateZ(${depth}px)`;

    return (
        <div className={clsx("relative preserve-3d", className)} style={wrapperStyle}>
            {/* TOP */}
            <div
                className={clsx("absolute top-0", borderClass)}
                style={{
                    height: `${sideWidth}px`,
                    width: `calc(100% + ${extraWidth}px)`,
                    clipPath: `polygon(0 0, 100% 0, calc(100% - ${halfExtraWidth}px) 100%, ${halfExtraWidth}px 100%)`,
                    transformOrigin: "top",
                    transform: `rotateX(${angle}deg) translate(-${halfExtraWidth}px, -${sideWidth}px)`,
                }}
            >
                <div
                    className={clsx("absolute", sideClass)}
                    style={{
                        height: `calc(100% - ${borderWidth * 2}px)`,
                        width: `calc(100% - ${borderWidth * 2}px)`,
                        left: `${borderWidth}px`,
                        right: `${borderWidth}px`,
                        top: `${borderWidth}px`,
                        bottom: `${borderWidth}px`,
                        clipPath: `polygon(0 0, 100% 0, calc(100% - ${halfExtraWidth}px) 100%, ${halfExtraWidth}px 100%)`,
                    }}
                ></div>
            </div>
            {/* BOTTOM */}
            <div
                className={clsx("absolute bottom-0", borderClass)}
                style={{
                    height: `${sideWidth}px`,
                    width: `calc(100% + ${extraWidth}px)`,
                    clipPath: `polygon(${halfExtraWidth}px 0, calc(100% - ${halfExtraWidth}px) 0, 100% 100%, 0 100%)`,
                    transformOrigin: "bottom",
                    transform: `rotateX(-${angle}deg) translate(-${halfExtraWidth}px, ${sideWidth}px)`,
                }}
            >
                <div
                    className={clsx("absolute", sideClass)}
                    style={{
                        height: `calc(100% - ${borderWidth * 2}px)`,
                        width: `calc(100% - ${borderWidth * 2}px)`,
                        left: `${borderWidth}px`,
                        right: `${borderWidth}px`,
                        top: `${borderWidth}px`,
                        bottom: `${borderWidth}px`,
                        clipPath: `polygon(${halfExtraWidth}px 0, calc(100% - ${halfExtraWidth}px) 0, 100% 100%, 0 100%)`,
                    }}
                ></div>
            </div>

            {/* CHILDREN */}
            {children}

            {/* LEFT */}
            <div
                className={clsx(`absolute left-0 top-0`, borderClass)}
                style={{
                    width: `${sideWidth}px`,
                    height: `calc(100% + ${extraWidth}px)`,
                    clipPath: `polygon(0 0, 100% ${halfExtraWidth}px, 100% calc(100% - ${halfExtraWidth}px), 0 100%)`,
                    transformOrigin: "left",
                    transform: `rotateY(-${angle}deg) translate(-${sideWidth}px, -${halfExtraWidth}px)`,
                }}
            >
                <div
                    className={clsx("absolute", sideClass)}
                    style={{
                        height: `calc(100% - ${borderWidth * 2}px)`,
                        width: `calc(100% - ${borderWidth * 2}px)`,
                        left: `${borderWidth}px`,
                        right: `${borderWidth}px`,
                        top: `${borderWidth}px`,
                        bottom: `${borderWidth}px`,
                        clipPath: `polygon(0 0, 100% ${halfExtraWidth}px, 100% calc(100% - ${halfExtraWidth}px), 0 100%)`,
                    }}
                ></div>
            </div>
            {/* RIGHT */}
            <div
                className={clsx("absolute right-0 top-0", borderClass)}
                style={{
                    width: `${sideWidth}px`,
                    height: `calc(100% + ${extraWidth}px)`,
                    clipPath: `polygon(0 ${halfExtraWidth}px, 100% 0, 100% 100%, 0 calc(100% - ${halfExtraWidth}px))`,
                    transformOrigin: "right",
                    transform: `rotateY(${angle}deg) translate(${sideWidth}px, -${halfExtraWidth}px)`,
                }}
            >
                <div
                    className={clsx("absolute", sideClass)}
                    style={{
                        height: `calc(100% - ${borderWidth * 2}px)`,
                        width: `calc(100% - ${borderWidth * 2}px)`,
                        left: `${borderWidth}px`,
                        right: `${borderWidth}px`,
                        top: `${borderWidth}px`,
                        bottom: `${borderWidth}px`,
                        clipPath: `polygon(0 ${halfExtraWidth}px, 100% 0, 100% 100%, 0 calc(100% - ${halfExtraWidth}px))`,
                    }}
                ></div>
            </div>
        </div>
    );
}
