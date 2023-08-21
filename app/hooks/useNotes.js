import useSWR from "swr";
const fetcher = async ([_, day]) => {
    return (await import(`../day/${day}/notes.mdx`)).default;
};

export function useNotes(day) {
    const { data, error } = useSWR(["notes", day], fetcher);
    return { Component: data, error };
}
