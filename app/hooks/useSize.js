import { useEffect, useLayoutEffect, useState } from "react";

export function useSize(ref) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            setWidth(ref.current.clientWidth);
            setHeight(ref.current.clientHeight);
        });

        observer.observe(ref.current);

        return () => observer.disconnect();
    });

    return { width, height };
}
