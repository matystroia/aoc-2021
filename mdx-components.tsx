import type { MDXComponents } from "mdx/types";

import { ObjectInspector } from "./app/components/ObjectInspector";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ObjectInspector,
        ...components,
    };
}
