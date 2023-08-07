import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = async ([url, isExample]) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw Error(data.error || "File not found");

    return { ...data, isExample };
};

export function useFile(filePath, example = false) {
    const { data, error, isLoading } = useSWR(
        ["/input/" + filePath + (example ? "example" : ""), example],
        fetcher
    );

    const isExample = useMemo(() => (data ? data.isExample : false), [data]);
    const rawText = useMemo(() => (data ? data.rawText : null), [data]);
    const lines = useMemo(() => (rawText ? rawText.split(/\r?\n/) : null), [rawText]);

    // useEffect(() => {
    //     let ignore = false;
    //     fetch("/input/" + filePath + (example ? "example" : ""))
    //         .then((response) => {
    //             if (!response.ok) throw new Error();
    //             return response;
    //         })
    //         .then((json) => {
    //             if (!ignore) {
    //                 console.log(res.status);
    //                 setRawText(json.rawText);
    //                 setIsExample(example);
    //             }
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //         });

    //     return () => {
    //         ignore = true;
    //     };
    // }, [filePath, example]);

    return { rawText, lines, isExample, error, isLoading };
}
