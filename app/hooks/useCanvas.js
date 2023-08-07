import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function useCanvas() {
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);

    const [size, setSize] = useState({ width: 0, height: 0 });

    // TODO: Having to account for the border sucks
    useLayoutEffect(() => {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        setSize({ width: width - 4, height: height - 4 });
    }, []);

    useEffect(() => {
        const onResize = () => {
            const { width, height } =
                wrapperRef.current.getBoundingClientRect();
            setSize({ width: width - 4, height: height - 4 });
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return {
        canvasRef,
        wrapperRef,
        canvasProps: {
            width: size.width,
            height: size.height,
            ref: canvasRef,
        },
    };
}
