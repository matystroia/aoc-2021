import { useEffect, experimental_useEffectEvent as useEffectEvent } from "react";

export function useMutationObserver(targetNode, attribute, onChange) {
    const onMutation = useEffectEvent((mutationList) => {
        onChange();
    });
    useEffect(() => {
        // console.log({ targetNode, callback, config });
        if (!targetNode) return;

        const observer = new MutationObserver(onMutation);
        observer.observe(targetNode, { attributeFilter: [attribute] });

        return () => observer.disconnect();
    }, [targetNode, attribute]);
}
