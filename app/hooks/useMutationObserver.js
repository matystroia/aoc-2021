import { useEffect, experimental_useEffectEvent as useEffectEvent } from "react";

export function useMutationObserver(targetNode, attribute, onChange) {
    const onMutation = useEffectEvent((mutationList) => {
        onChange();
    });
    useEffect(() => {
        if (!targetNode) return;

        const observer = new MutationObserver(onMutation);
        observer.observe(targetNode, { attributeFilter: [attribute] });

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetNode, attribute]);
}
