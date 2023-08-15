"use client";

import {
    Fragment,
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { clone, flatMap, flatten, map, maxBy, minBy, random, reduce, sample, sumBy } from "lodash";
import clsx from "clsx";
import { useMouse } from "app/hooks/useMouse";
import { useImmer } from "use-immer";
import { v4 as uuid } from "uuid";
import { getSegmentIntersection } from "app/utils";
import { useMutationObserver } from "app/hooks/useMutationObserver";

function hexToBits(hex) {
    return flatMap(Array.from(hex), (x) =>
        Array.from(parseInt(x, 16).toString(2).padStart(4, "0"))
    );
}

function bitsToLiteral(bits) {
    return parseInt(bits.join(""), 2);
}

class Packet {
    constructor(bits) {
        this.length = 0;
        this.bits = [];
        this.generator = function* () {
            for (const bit of bits) {
                this.length += 1;
                this.bits.push(bit);
                yield bit;
            }
        }.bind(this)();

        this.nextBit = () => this.generator.next().value;
        this.nextBits = (n) => Array.from({ length: n }, () => this.nextBit());

        this.header = {
            version: bitsToLiteral(this.nextBits(3)),
            typeId: bitsToLiteral(this.nextBits(3)),
        };

        if (this.header.typeId === 4) {
            this.content = new Packet.LiteralContent(this);
        } else {
            this.content = new Packet.OperatorContent(this);
        }
    }

    getValue() {
        return this.content.getValue();
    }

    static Content = class {
        constructor(packet) {
            this.packet = packet;
        }
    };

    static LiteralContent = class extends Packet.Content {
        constructor(packet) {
            super(packet);
            this.groups = [];
            let bits;
            do {
                bits = packet.nextBits(5);
                this.groups.push(bits.slice(1));
            } while (bits[0] === "1");
            this.value = this.getValue();
        }

        getValue() {
            return parseInt(flatten(this.groups).join(""), 2);
        }
    };

    static OperatorContent = class extends Packet.Content {
        constructor(packet) {
            super(packet);
            this.lengthTypeId = packet.nextBit();
            if (this.lengthTypeId === "0") {
                this.bitsLength = bitsToLiteral(packet.nextBits(15));
            } else {
                this.subPacketCount = bitsToLiteral(packet.nextBits(11));
            }

            this.subPackets = [];
            while (
                (this.bitsLength && sumBy(this.subPackets, "length") < this.bitsLength) ||
                (this.subPacketCount && this.subPackets.length < this.subPacketCount)
            ) {
                this.subPackets.push(new Packet(packet.generator));
            }
            this.value = this.getValue();
        }

        getValue() {
            switch (this.packet.header.typeId) {
                case 0:
                    return reduce(this.subPackets, (acc, p) => acc + p.getValue(), 0);
                case 1:
                    return reduce(this.subPackets, (acc, p) => acc * p.getValue(), 1);
                case 2:
                    return minBy(this.subPackets, (p) => p.getValue()).getValue();
                case 3:
                    return maxBy(this.subPackets, (p) => p.getValue()).getValue();
                case 5:
                    return Number(this.subPackets[0].getValue() > this.subPackets[1].getValue());
                case 6:
                    return Number(this.subPackets[0].getValue() < this.subPackets[1].getValue());
                case 7:
                    return Number(this.subPackets[0].getValue() === this.subPackets[1].getValue());
            }
        }
    };
}

function BitsGroup({ bits, name, className, children }) {
    const ref = useRef();
    const { windowId } = useContext(WindowContext);
    const { onWindowAdd } = useContext(TerminalContext);

    const handleClick = () => {
        onWindowAdd(windowId, children, ref.current, className);
    };

    return (
        <div
            ref={ref}
            className={clsx(
                "border-4 border-double flex items-center px-1 select-none cursor-pointer transition-transform",
                className
            )}
            onClick={handleClick}
        >
            <div className="">{bits}</div>
            {/* <div className="absolute left-0 -top-6">{name}</div> */}
        </div>
    );
}

function PacketLiteralContent({ bits, value }) {
    return value;
}

function PacketOperatorContent({
    bits,
    lengthTypeId,
    bitsLength,
    subPacketCount,
    subPackets,
    value,
}) {
    const secondGroup = lengthTypeId === "0" ? bits.slice(1, 16) : bits.slice(1, 12);
    return (
        <div className="flex items-center gap-2">
            <BitsGroup bits={[lengthTypeId]} className="border-violet-700" />
            <BitsGroup bits={secondGroup} className="border-cyan-700" />
            {subPackets.map((packet, i) => (
                <BitsGroup key={i} bits={packet.bits} className="border-rose-700">
                    {{ title: "Packet", content: <PacketVisualizer packet={packet} /> }}
                </BitsGroup>
            ))}
            <div>= {value}</div>
        </div>
    );
}

function PacketHeader({ version, typeId }) {
    return (
        <div className="flex flex-col p-4 border-2 border-emerald-400">
            <div className="self-end">Header</div>
            <div>Version: {version}</div>
            <div>Type ID: {typeId}</div>
        </div>
    );
}

function Link({ fromWindowNode, toWindowNode, parentNode, className }) {
    const [rootBox, setRootBox] = useState(null);
    const ref = useRef();
    useLayoutEffect(() => {
        setRootBox(ref.current.getBoundingClientRect());
    }, []);

    const [fromBox, setFromBox] = useState(null);
    const [toBox, setToBox] = useState(null);

    const handleUpdateFromNode = useCallback(() => {
        if (!parentNode || !rootBox) return;
        const box = parentNode.getBoundingClientRect();
        setFromBox({
            x: box.x - rootBox.x,
            y: box.y - rootBox.y,
            width: box.width,
            height: box.height,
        });
    }, [rootBox, parentNode]);

    const handleUpdateToNode = useCallback(() => {
        if (!toWindowNode || !rootBox) return;
        const box = toWindowNode.getBoundingClientRect();
        setToBox({
            x: box.x - rootBox.x,
            y: box.y - rootBox.y,
            width: box.width,
            height: box.height,
        });
    }, [rootBox, toWindowNode]);

    useEffect(() => {
        handleUpdateFromNode();
    }, [handleUpdateFromNode]);

    useEffect(() => {
        handleUpdateToNode();
    }, [handleUpdateToNode]);

    useMutationObserver(fromWindowNode, "style", () => {
        handleUpdateFromNode();
    });

    useMutationObserver(toWindowNode, "style", () => {
        handleUpdateToNode();
    });

    if (!fromBox || !toBox) return <div ref={ref}></div>;

    const xIntersection = getSegmentIntersection(
        [fromBox.x, fromBox.x + fromBox.width],
        [toBox.x, toBox.x + toBox.width]
    );
    const yIntersection = getSegmentIntersection(
        [fromBox.y, fromBox.y + fromBox.height],
        [toBox.y, toBox.y + toBox.height]
    );

    const [left, right] = fromBox.x < toBox.x ? [fromBox, toBox] : [toBox, fromBox];
    const [top, bottom] = fromBox.y < toBox.y ? [fromBox, toBox] : [toBox, fromBox];

    const lines = [];
    if (xIntersection && !yIntersection) {
        lines.push(
            <div
                className={clsx("absolute border-l-2 border-dotted w-1 z-50", className)}
                style={{
                    height: bottom.y - top.y - top.height,
                    transform: `translate(${(xIntersection[0] + xIntersection[1]) / 2}px, ${
                        top.y + top.height
                    }px)`,
                }}
            ></div>
        );
    } else if (yIntersection && !xIntersection) {
        lines.push(
            <div
                className={clsx("absolute border-t-2 border-dotted h-1", className)}
                style={{
                    width: right.x - left.x - left.width,
                    transform: `translate(${left.x + left.width}px, ${
                        (yIntersection[0] + yIntersection[1]) / 2
                    }px)`,
                }}
            ></div>
        );
    } else if (!xIntersection && !yIntersection) {
        lines.push(
            <div
                className={clsx("absolute border-l-2 border-dotted w-1", className)}
                style={{
                    height: bottom.y - top.y - top.height + bottom.height / 2,
                    transform: `translate(${top.x + top.width / 2}px, ${top.y + top.height}px)`,
                }}
            ></div>,
            <div
                className={clsx("absolute border-t-2 border-dotted h-1", className)}
                style={{
                    width: right.x - left.x - left.width + top.width / 2,
                    transform: `translate(${Math.min(
                        top.x + top.width / 2,
                        left.x + left.width
                    )}px, ${
                        top.y + top.height + bottom.y - top.y - top.height + bottom.height / 2
                    }px)`,
                }}
            ></div>
        );
    }

    return (
        <div ref={ref} className="absolute">
            {lines}
            {false && (
                <div
                    className="absolute w-1 border border-dotted border-amber-500"
                    style={{
                        height: deltaY,
                        transform: `translate(${top.x + top.width / 2}px, ${top.y}px)`,
                    }}
                ></div>
            )}
            {false && (
                <div
                    className="absolute h-1 border border-teal-500 border-dotted"
                    style={{
                        width: deltaX,
                        transform: `translate(${left.x}px, ${bottom.y}px)`,
                    }}
                ></div>
            )}
        </div>
    );
}

const WindowContext = createContext();
const TerminalWindow = forwardRef(function TerminalWindow(
    { title, id, children, parentId, parentGroup, x, y },
    ref
) {
    const { onWindowClose, onWindowDown } = useContext(TerminalContext);

    const handleClose = () => {
        onWindowClose(id);
    };

    const handleDown = () => {
        onWindowDown(id);
    };

    // useLayoutEffect(() => {
    //     const { width, height } = ref.current.getBoundingClientRect();
    //     onWindowResize(id, width, height);
    // }, [id, onWindowResize]);

    return (
        <div
            ref={ref}
            className="absolute flex flex-col font-mono border-4 border-neutral-900 bg-neutral-950 text-neutral-50 terminal"
            style={{ transform: `translate(${x}px, ${y}px)` }}
        >
            <div
                className="flex items-center h-6 px-2 select-none bg-neutral-900"
                onPointerDown={handleDown}
            >
                <div className="mr-4">{title}</div>
                <span className="text-xs">{id}</span>
                <div className="flex gap-2 ml-auto">
                    <div className="w-4 h-3 bg-neutral-800"></div>
                    <button
                        className="w-4 h-3 cursor-pointer bg-neutral-600 hover:bg-red-600"
                        onClick={handleClose}
                    ></button>
                </div>
            </div>
            <div className="p-4">
                <WindowContext.Provider value={{ windowId: id }}>{children}</WindowContext.Provider>
            </div>
        </div>
    );
});

const TerminalContext = createContext();
function TerminalScreen({ children }) {
    const createWindow = (window, parentId, parentNode, linkClass) => ({
        ...window,
        parentId,
        parentNode,
        linkClass,
        id: uuid(),
        x: 100,
        y: 100,
    });
    const [windows, updateWindows] = useImmer([createWindow(children)]);
    const windowRefs = useRef(new Map());

    const handleWindowAdd = useCallback(
        (parentId, window, parentNode, linkClass) => {
            updateWindows((draft) => {
                draft.push(createWindow(window, parentId, parentNode, linkClass));
            });
        },
        [updateWindows]
    );

    const handleWindowClose = useCallback(
        (windowId) => {
            updateWindows((draft) => {
                const getDescendants = (windows, id) => {
                    const ret = [id];
                    windows
                        .filter(({ parentId }) => parentId === id)
                        .forEach((w) => {
                            ret.push(...getDescendants(windows, w.id));
                        });
                    return ret;
                };
                const descendants = getDescendants(draft, windowId);
                return draft.filter(({ id }) => !descendants.includes(id));
            });
        },
        [updateWindows]
    );

    const ref = useRef();

    const [activeWindowId, setActiveWindowId] = useState(null);
    const handleWindowDown = useCallback(
        (windowId) => {
            const i = windows.findIndex((w) => w.id === windowId);
            // Move to front
            updateWindows((draft) => {
                const [window] = draft.splice(i, 1);
                draft.push(window);
            });
            setActiveWindowId(windowId);
        },
        [updateWindows, windows]
    );
    const handleWindowUp = useCallback(() => {
        setActiveWindowId(null);
    }, []);

    const handlePointerMove = (e) => {
        if (!activeWindowId) return;
        updateWindows((draft) => {
            const window = draft.find((w) => w.id === activeWindowId);
            window.x += e.movementX;
            window.y += e.movementY;
        });
    };

    // const handleWindowResize = useCallback(
    //     (windowId, width, height) => {
    //         updateWindows((draft) => {
    //             const window = draft.find((w) => w.id === windowId);
    //             window.width = width;
    //             window.height = height;
    //         });
    //     },
    //     [updateWindows]
    // );

    // const handleGroupResize = useCallback(
    //     (windowId, groupName, width, height) => {
    //         updateWindows((draft) => {
    //             const window = draft.find((w) => w.id === windowId);
    //             console.log({ windowId, groupName, width, height, x: window.x, y: window.y });
    //             window.groups[groupName] = { width, height, x: window.x, y: window.y };
    //         });
    //     },
    //     [updateWindows]
    // );

    return (
        <div
            ref={ref}
            className="relative h-full overflow-hidden border-8 bg-neutral-800 border-neutral-900"
            onPointerMove={handlePointerMove}
            onPointerUp={handleWindowUp}
        >
            <TerminalContext.Provider
                value={{
                    onWindowAdd: handleWindowAdd,
                    onWindowClose: handleWindowClose,
                    onWindowDown: handleWindowDown,
                }}
            >
                {windows.map((window) => (
                    <TerminalWindow
                        key={window.id}
                        ref={(node) => {
                            if (node) windowRefs.current.set(window.id, node);
                            else windowRefs.current.delete(window.id);
                        }}
                        {...window}
                    >
                        {window.content}
                    </TerminalWindow>
                ))}
                {windows.map(
                    (window) =>
                        window.parentId &&
                        window.parentNode && (
                            <Link
                                key={window.id}
                                fromWindowNode={windowRefs.current.get(window.parentId)}
                                toWindowNode={windowRefs.current.get(window.id)}
                                parentNode={window.parentNode}
                                className={window.linkClass}
                            />
                        )
                )}
            </TerminalContext.Provider>
        </div>
    );
}

function PacketVisualizer({ packet }) {
    const versionBits = packet.bits.slice(0, 3);
    const typeIdBits = packet.bits.slice(3, 6);
    const contentBits = packet.bits.slice(6);
    const Content = packet.header.typeId === 4 ? PacketLiteralContent : PacketOperatorContent;

    return (
        <div className="flex items-center gap-2">
            <BitsGroup bits={versionBits} name="V" className="border-amber-700">
                {{ title: "Version", content: packet.header.version }}
            </BitsGroup>
            <BitsGroup bits={typeIdBits} name="T" className="border-fuchsia-700">
                {{ title: "Type ID", content: packet.header.typeId }}
            </BitsGroup>
            <BitsGroup bits={contentBits} name="Content" className="border-emerald-700">
                {{
                    title: packet.header.typeId === 4 ? "Literal" : "Operator",
                    content: <Content {...packet.content} bits={contentBits} />,
                }}
            </BitsGroup>
        </div>
    );
}

export default function Day16() {
    const { lines, isPartOne } = useContext(ChallengeContext);
    const hex = lines[0];
    const bits = hexToBits(hex);
    const packet = new Packet(bits);

    // const ans = isPartOne ? getVersionSum(packet) : getResult(packet);

    return (
        <div className="h-full">
            <TerminalScreen>
                {{ title: "Packet", content: <PacketVisualizer packet={packet} /> }}
            </TerminalScreen>
        </div>
    );
}
