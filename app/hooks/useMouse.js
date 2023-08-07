import { useEffect, useState } from "react";

export function useMouse(nodeRef) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const node = nodeRef === undefined ? window : nodeRef.current;
        if (!node) return;

        const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
        node.addEventListener("pointermove", handleMove);
        return () => node.removeEventListener("pointermove", handleMove);
    }, [nodeRef]);

    const [isDown, setIsDown] = useState(false);
    useEffect(() => {
        const node = nodeRef === undefined ? window : nodeRef.current;
        if (!node) return;

        const handleDown = () => setIsDown(true);
        const handleUp = () => setIsDown(false);
        node.addEventListener("pointerdown", handleDown);
        node.addEventListener("pointerup", handleUp);
        return () => {
            node.removeEventListener("pointerdown", handleDown);
            node.removeEventListener("pointerup", handleUp);
        };
    }, [nodeRef]);

    const [isInside, setIsInside] = useState(false);
    useEffect(() => {
        const node = nodeRef === undefined ? window : nodeRef.current;
        if (!node) return;

        const handleEnter = () => setIsInside(true);
        const handleLeave = () => setIsInside(false);
        node.addEventListener("pointerenter", handleEnter);
        node.addEventListener("pointerleave", handleLeave);
        return () => {
            node.removeEventListener("pointerenter", handleEnter);
            node.removeEventListener("pointerleave", handleLeave);
        };
    }, [nodeRef]);

    let relativePosition = position;
    if (nodeRef !== undefined && nodeRef.current) {
        const boundingRect = nodeRef.current.getBoundingClientRect();

        relativePosition = {
            x: (position.x - boundingRect.left) / boundingRect.width,
            y: (position.y - boundingRect.top) / boundingRect.height,
        };
    }

    // TODO: Drag position

    return { isDown, isInside, position, relativePosition };
}
