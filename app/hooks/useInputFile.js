import useSWR from "swr";
import { useMemo } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const fetcher = async ([url, isExample]) => {
    const res = await fetch(url);
    const rawText = (await res.text()).trimEnd();
    if (!res.ok) throw Error(data.error || "File not found");

    return { rawText, isExample };
};

export function useInputFile(day, example = false) {
    const url = `${basePath}/input/${day}${example ? "example" : ""}.txt`;
    const { data, error, isLoading } = useSWR([url, example], fetcher);

    const isExample = useMemo(() => (data ? data.isExample : false), [data]);
    const rawText = useMemo(() => (data ? data.rawText : null), [data]);
    const lines = useMemo(() => (rawText ? rawText.split(/\r?\n/) : null), [rawText]);

    return { rawText, lines, isExample, error, isLoading };
}
