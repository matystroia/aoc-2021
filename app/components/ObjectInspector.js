import clsx from "clsx";
import { createContext, useContext, useState } from "react";

const LevelContext = createContext(0);

const Type = {
    Number: "number",
    String: "string",
    Array: "array",
    Object: "object",

    get(object) {
        if (Array.isArray(object)) return Type.Array;
        if (typeof object === "number") return Type.Number;
        if (typeof object === "string") return Type.String;
        return Type.Object;
    },
};

function buildInline(obj) {
    const type = Type.get(obj);
    if (type === Type.Number) return <span className="text-emerald-500">{obj}</span>;
    if (type === Type.String) return <span className="text-rose-500">{`'${obj}'`}</span>;

    const isArray = type === Type.Array;
    const properties = isArray ? obj : Object.entries(obj);

    let spans;
    if (isArray) spans = properties.map((x) => buildInline(x));
    else {
        spans = properties.map(([key, value]) => (
            <span key={key}>
                <span className="text-cyan-500">{key}</span>
                <span className="text-zinc-500 mr-1">{":"}</span>
                {buildInline(value)}
            </span>
        ));
    }

    // TODO: Should occlude based on DOM size
    if (spans.length > 5) spans.splice(2, spans.length - 4, <span>...</span>);

    const [left, right] = isArray ? "[]" : "{}";
    return (
        <span>
            <span className="mr-1 text-amber-500">{left}</span>
            {spans.map((span, i) => (
                <span key={i}>
                    {span}
                    {i < spans.length - 1 && <span className="text-amber-500 mr-2">{","}</span>}
                </span>
            ))}
            <span className="ml-1 text-amber-500">{right}</span>
        </span>
    );
}

function ExpandButton({ isExpanded, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx("scale-75 transition-transform", isExpanded && "rotate-90")}
        >
            ▶
        </button>
    );
}

function PropertyListItem({ property, initialIsExpanded = false }) {
    const { key, value } = property;
    const type = Type.get(value);
    const valueComponent = {
        [Type.Number]: <span className="text-emerald-500">{value}</span>,
        [Type.String]: <span className="text-rose-500">{`'${value}'`}</span>,
        [Type.Array]: (
            <span>
                <span className="text-zinc-500 mr-1">{`(${value.length})`}</span>
                <span>{buildInline(value)}</span>
            </span>
        ),
        [Type.Object]: <span>{buildInline(value)}</span>,
    }[type];

    const [isExpanded, setIsExpanded] = useState(initialIsExpanded);
    const isExpandable = type === Type.Array || type === Type.Object;

    const level = useContext(LevelContext);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <div className="w-5">
                    {isExpandable && (
                        <ExpandButton
                            isExpanded={isExpanded}
                            onClick={() => setIsExpanded(!isExpanded)}
                        />
                    )}
                </div>
                {key && (
                    <div className="mr-2">
                        <span className="text-cyan-500">{key}</span>
                        <span className="text-zinc-500">{":"}</span>
                    </div>
                )}
                {valueComponent}
            </div>
            {isExpanded && (
                <LevelContext.Provider value={level + 1}>
                    <PropertyList properties={Object.entries(value)} />
                </LevelContext.Provider>
            )}
        </div>
    );
}

function PropertyList({ properties }) {
    const level = useContext(LevelContext);

    return (
        <div style={{ marginLeft: `${level * 0.5}rem` }}>
            {properties.map(([key, value]) => (
                <PropertyListItem key={key} property={{ key, value }} />
            ))}
        </div>
    );
}

export function ObjectInspector({ children }) {
    return (
        <div>
            <LevelContext.Provider value={1}>
                <PropertyListItem
                    property={{ key: null, value: children }}
                    initialIsExpanded={true}
                />
            </LevelContext.Provider>
        </div>
    );
}
